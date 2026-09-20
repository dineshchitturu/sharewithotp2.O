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
    } else {
      // Fallback community TURN relay to guarantee connectivity across cellular networks / symmetric NATs
      iceServers.push({
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
          'turns:openrelay.metered.ca:443',
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject',
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

    this.pc.onconnectionstatechange = () => {
      if (this.pc) {
        console.info('[WebRTC] Connection state changed:', this.pc.connectionState);
        this.onConnectionStateChange(this.pc.connectionState);
      }
    };

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
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    this.hasRemoteDescription = true;
    await this.processPendingCandidates();

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) throw new Error('PeerConnection not initialized');
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
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn('[WebRTC] Failed to add ICE candidate:', err);
    }
  }

  private async processPendingCandidates(): Promise<void> {
    if (!this.pc) return;
    while (this.pendingIceCandidates.length > 0) {
      const candidate = this.pendingIceCandidates.shift();
      if (candidate) {
        try {
          if (!candidate.candidate && candidate.candidate !== '') continue;
          await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn('[WebRTC] Error processing pending candidate:', err);
        }
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
