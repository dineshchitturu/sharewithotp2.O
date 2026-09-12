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
    const iceServers: RTCIceServer[] = [{ urls: stunServer }];

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

    this.pc.onconnectionstatechange = () => {
      if (this.pc) {
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
        this.dataChannel.close();
      } catch {}
      this.dataChannel = null;
    }

    if (this.pc) {
      try {
        this.pc.close();
      } catch {}
      this.pc = null;
    }

    this.pendingIceCandidates = [];
    this.hasRemoteDescription = false;
  }
}
