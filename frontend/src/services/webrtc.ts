export interface WebRTCConfig {
  stunUrl?: string;
  turnUrl?: string;
  turnUsername?: string;
  turnCredential?: string;
}

export class WebRTCManager {
  public pc: RTCPeerConnection | null = null;
  public dataChannel: RTCDataChannel | null = null;
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private hasRemoteDescription: boolean = false;
  private config: WebRTCConfig;
  private onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  private onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  private onDataChannelReceived?: (channel: RTCDataChannel) => void;

  constructor(
    config: WebRTCConfig = {},
    onIceCandidate: (candidate: RTCIceCandidateInit) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void,
    onDataChannelReceived?: (channel: RTCDataChannel) => void
  ) {
    this.config = config;
    this.onIceCandidate = onIceCandidate;
    this.onConnectionStateChange = onConnectionStateChange;
    this.onDataChannelReceived = onDataChannelReceived;
  }

  public initialize(isInitiator: boolean): RTCPeerConnection {
    this.close();

    const stunServer = this.config.stunUrl || import.meta.env.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302';
    const iceServers: RTCIceServer[] = [
      {
        urls: [
          stunServer,
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302',
          'stun:stun.cloudflare.com:3478',
        ],
      },
    ];

    const turnServer = this.config.turnUrl || import.meta.env.VITE_TURN_SERVER;
    if (turnServer) {
      iceServers.push({
        urls: turnServer,
        username: this.config.turnUsername || import.meta.env.VITE_TURN_USERNAME,
        credential: this.config.turnCredential || import.meta.env.VITE_TURN_CREDENTIAL,
      });
    }

    this.pc = new RTCPeerConnection({ iceServers });
    this.hasRemoteDescription = false;
    this.pendingIceCandidates = [];

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidate(event.candidate.toJSON());
      }
    };

    const handleStateChange = () => {
      if (!this.pc) return;
      const connState = this.pc.connectionState;
      const iceState = this.pc.iceConnectionState;
      console.info(`[WebRTC State]: connectionState=${connState}, iceConnectionState=${iceState}`);

      if (connState === 'connected' || iceState === 'connected' || iceState === 'completed') {
        this.onConnectionStateChange('connected');
      } else if (connState === 'failed') {
        this.onConnectionStateChange('failed');
      } else if (connState === 'disconnected') {
        this.onConnectionStateChange('disconnected');
      } else if (connState === 'connecting' || iceState === 'checking') {
        this.onConnectionStateChange('connecting');
      }
    };

    this.pc.onconnectionstatechange = handleStateChange;
    this.pc.oniceconnectionstatechange = handleStateChange;

    if (isInitiator) {
      // Sender creates the DataChannel
      this.dataChannel = this.pc.createDataChannel('fileTransfer', {
        ordered: true,
      });
      this.dataChannel.binaryType = 'arraybuffer';
    } else {
      // Receiver waits for the incoming DataChannel
      this.pc.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.dataChannel.binaryType = 'arraybuffer';
        if (this.onDataChannelReceived) {
          this.onDataChannelReceived(this.dataChannel);
        }
      };
    }

    return this.pc;
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) throw new Error('PeerConnection not initialized');

    // If an offer was already created and is currently waiting for answer, return existing local description
    if (this.pc.signalingState === 'have-local-offer' && this.pc.localDescription) {
      console.info('[WebRTC] Local offer already pending, reusing existing local description.');
      return this.pc.localDescription;
    }

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  public async restartIce(): Promise<RTCSessionDescriptionInit | null> {
    if (!this.pc) return null;
    try {
      console.info('[WebRTC] Initiating ICE restart offer...');
      const offer = await this.pc.createOffer({ iceRestart: true });
      await this.pc.setLocalDescription(offer);
      return offer;
    } catch (err) {
      console.warn('[WebRTC] ICE restart failed:', err);
      return null;
    }
  }

  public isDataChannelOpen(): boolean {
    return this.dataChannel !== null && this.dataChannel.readyState === 'open';
  }

  public async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) throw new Error('PeerConnection not initialized');

    if (this.pc.signalingState === 'have-remote-offer') {
      console.info('[WebRTC] Already have remote offer, updating remote description.');
    }

    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    this.hasRemoteDescription = true;

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    // Apply pending remote ICE candidates after setting local description answer so local transports are initialized
    await this.processPendingCandidates();
    return answer;
  }

  public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) throw new Error('PeerConnection not initialized');

    // If already in 'stable' state, answer was already processed or connection established
    if (this.pc.signalingState === 'stable') {
      console.info('[WebRTC] Connection signalingState is already stable. Ignoring redundant answer.');
      return;
    }

    if (this.pc.signalingState !== 'have-local-offer') {
      console.warn(`[WebRTC] Cannot apply answer in signalingState '${this.pc.signalingState}'. Ignoring.`);
      return;
    }

    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    this.hasRemoteDescription = true;
    await this.processPendingCandidates();
  }

  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.pc || !this.hasRemoteDescription) {
      this.pendingIceCandidates.push(candidate);
      return;
    }
    try {
      if (!candidate || (!candidate.candidate && candidate.candidate !== '')) return;
      await this.pc.addIceCandidate(candidate);
    } catch (err) {
      console.warn('[WebRTC] Failed to add ICE candidate:', err);
    }
  }

  private async processPendingCandidates(): Promise<void> {
    if (!this.pc) return;
    const candidates = [...this.pendingIceCandidates];
    this.pendingIceCandidates = [];
    for (const candidate of candidates) {
      try {
        if (!candidate || (!candidate.candidate && candidate.candidate !== '')) continue;
        await this.pc.addIceCandidate(candidate);
      } catch (err) {
        console.warn('[WebRTC] Error processing pending candidate:', err);
      }
    }
  }

  public close(): void {
    if (this.dataChannel) {
      try {
        this.dataChannel.onopen = null;
        this.dataChannel.onclose = null;
        this.dataChannel.onerror = null;
        this.dataChannel.onmessage = null;
        if (this.dataChannel.readyState === 'open' || this.dataChannel.readyState === 'connecting') {
          this.dataChannel.close();
        }
      } catch {}
      this.dataChannel = null;
    }

    if (this.pc) {
      try {
        this.pc.onicecandidate = null;
        this.pc.onconnectionstatechange = null;
        this.pc.ondatachannel = null;
        this.pc.close();
      } catch {}
      this.pc = null;
    }

    this.pendingIceCandidates = [];
    this.hasRemoteDescription = false;
  }
}
