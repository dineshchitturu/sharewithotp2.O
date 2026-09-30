export interface WebRTCConfig {
  stunUrl?: string;
  turnUrl?: string;
  turnUsername?: string;
  turnCredential?: string;
  iceServers?: RTCIceServer[];
}

export interface ConnectionDiagnostics {
  connectionType: 'host' | 'srflx' | 'prflx' | 'relay' | 'unknown';
  localCandidateType?: string;
  remoteCandidateType?: string;
  localProtocol?: string;
  bytesSent?: number;
  bytesReceived?: number;
  currentRoundTripTime?: number;
}

/**
 * Returns ICE server configurations (STUN servers and optional TURN relays).
 *
 * Direct P2P connectivity is always attempted first (host/srflx candidates).
 * TURN relay candidates are only utilized when direct hole-punching fails
 * (e.g. across Symmetric NATs or strict corporate firewalls) AND a valid TURN
 * server is configured in environment variables or configuration.
 */
export function getDefaultIceServers(config: WebRTCConfig = {}): RTCIceServer[] {
  // If caller provided pre-configured iceServers (e.g. from backend response), use them directly
  if (config.iceServers && Array.isArray(config.iceServers) && config.iceServers.length > 0) {
    return config.iceServers;
  }

  const servers: RTCIceServer[] = [];

  // 1. High-availability public STUN servers for NAT discovery (direct P2P hole-punching)
  const stunCandidates = [
    config.stunUrl || import.meta.env.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
    'stun:stun2.l.google.com:19302',
    'stun:stun3.l.google.com:19302',
    'stun:stun4.l.google.com:19302',
    'stun:stun.cloudflare.com:3478',
  ];
  const uniqueStuns = Array.from(new Set(stunCandidates.filter(Boolean)));
  servers.push({ urls: uniqueStuns });

  // 2. Custom TURN server ONLY IF explicitly configured via config or Vite environment
  const customTurn = config.turnUrl || import.meta.env.VITE_TURN_SERVER;
  if (customTurn) {
    const urls = customTurn.includes(',')
      ? customTurn.split(',').map((u: string) => u.trim()).filter(Boolean)
      : customTurn;
    servers.push({
      urls,
      username: config.turnUsername || import.meta.env.VITE_TURN_USERNAME,
      credential: config.turnCredential || import.meta.env.VITE_TURN_CREDENTIAL,
    });
  }

  return servers;
}

export class WebRTCManager {
  public pc: RTCPeerConnection | null = null;
  public dataChannel: RTCDataChannel | null = null;
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private localIceCandidates: RTCIceCandidateInit[] = [];
  private seenLocalCandidates: Set<string> = new Set();
  private seenRemoteCandidates: Set<string> = new Set();
  private hasRemoteDescription: boolean = false;
  private lastReportedState: RTCPeerConnectionState | null = null;
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

  private extractCandidateType(candidateStr?: string): string {
    if (!candidateStr) return 'unknown';
    const match = candidateStr.match(/\styp\s+(\w+)/i);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  private sanitizeCandidate(candidate: RTCIceCandidateInit): RTCIceCandidateInit | null {
    if (!candidate || (!candidate.candidate && candidate.candidate !== '')) {
      return null;
    }
    let sdpMid = candidate.sdpMid;
    let sdpMLineIndex = typeof candidate.sdpMLineIndex === 'number' ? candidate.sdpMLineIndex : undefined;

    // If both are missing, safely default to the primary media stream line (0)
    if (sdpMid == null && sdpMLineIndex == null) {
      sdpMid = '0';
      sdpMLineIndex = 0;
    }

    return {
      candidate: candidate.candidate,
      sdpMid: sdpMid != null ? String(sdpMid) : undefined,
      sdpMLineIndex,
      usernameFragment: candidate.usernameFragment,
    };
  }

  private handleStateChange(state: RTCPeerConnectionState) {
    if (this.lastReportedState === state) return;
    this.lastReportedState = state;
    this.onConnectionStateChange(state);

    if (state === 'connected') {
      // Run diagnostic stats inspection when connected to log candidate pair details
      this.getConnectionDiagnostics().then((diag) => {
        const typeDesc =
          diag.connectionType === 'host'
            ? 'host/local (Direct LAN - Same Network)'
            : diag.connectionType === 'srflx'
            ? 'server-reflexive (STUN NAT Hole Punching - Direct P2P)'
            : diag.connectionType === 'relay'
            ? 'relay (TURN Server Relay)'
            : diag.connectionType;
        console.info(`[WebRTC Diagnostics] Selected ICE Candidate Type: ${typeDesc}`);
        console.info(`[WebRTC Diagnostics] Pair: local=${diag.localCandidateType || 'unknown'} -> remote=${diag.remoteCandidateType || 'unknown'}, rtt=${diag.currentRoundTripTime != null ? (diag.currentRoundTripTime * 1000).toFixed(1) + 'ms' : 'unknown'}`);
      }).catch(() => {});
    }
  }

  public initialize(isInitiator: boolean): RTCPeerConnection {
    this.close();

    const iceServers = getDefaultIceServers(this.config);

    const hasTurn = iceServers.some((s) => {
      const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
      return urls.some((u) => typeof u === 'string' && (u.startsWith('turn:') || u.startsWith('turns:')));
    });
    console.info(`[WebRTC] Initializing RTCPeerConnection (STUN: active, TURN: ${hasTurn ? 'configured' : 'not configured'})`);

    this.pc = new RTCPeerConnection({
      iceServers,
      bundlePolicy: 'max-bundle',
    });
    this.hasRemoteDescription = false;
    this.pendingIceCandidates = [];
    this.localIceCandidates = [];
    this.seenLocalCandidates.clear();
    this.seenRemoteCandidates.clear();
    this.lastReportedState = null;

    // Log ICE candidate generation and dispatch to signaling
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        const type = event.candidate.type || this.extractCandidateType(event.candidate.candidate);
        console.info(`[WEBRTC] ICE candidate type: ${type}`);
        console.info('[ICE] GENERATED');
        const rawCand = event.candidate.toJSON();
        const cand = this.sanitizeCandidate(rawCand);
        if (cand && (cand.candidate || cand.candidate === '')) {
          const key = `${cand.candidate}|${cand.sdpMid}|${cand.sdpMLineIndex}`;
          if (!this.seenLocalCandidates.has(key)) {
            this.seenLocalCandidates.add(key);
            this.localIceCandidates.push(cand);
            this.onIceCandidate(cand);
          }
        }
      } else {
        console.info('[WebRTC] ICE candidate gathering finished (null candidate).');
      }
    };

    (this.pc as any).onicecandidateerror = (event: any) => {
      console.warn(
        `[WEBRTC] ICE candidate error: address=${event.address || event.hostCandidate}, port=${event.port}, url=${event.url}, code=${event.errorCode}, text=${event.errorText}`
      );
    };

    // Monitor gathering state
    this.pc.onicegatheringstatechange = () => {
      if (this.pc) {
        console.info(`[WEBRTC] ICE gathering: ${this.pc.iceGatheringState}`);
      }
    };

    // Monitor signaling state
    this.pc.onsignalingstatechange = () => {
      if (this.pc) {
        console.info('[WebRTC] Signaling state:', this.pc.signalingState);
      }
    };

    // Monitor aggregate PeerConnection state (DTLS + ICE)
    this.pc.onconnectionstatechange = () => {
      if (this.pc) {
        console.info('[WebRTC] Connection:', this.pc.connectionState);
        this.handleStateChange(this.pc.connectionState);
      }
    };

    // Monitor ICE connection state
    this.pc.oniceconnectionstatechange = () => {
      if (this.pc) {
        console.info('[WebRTC] ICE:', this.pc.iceConnectionState);
        const iceState = this.pc.iceConnectionState;
        if (iceState === 'connected' || iceState === 'completed') {
          this.handleStateChange('connected');
        } else if (iceState === 'failed') {
          if (this.pc.connectionState !== 'failed') {
            this.handleStateChange('failed');
          }
        } else if (iceState === 'disconnected') {
          if (this.pc.connectionState !== 'disconnected' && this.pc.connectionState !== 'failed') {
            this.handleStateChange('disconnected');
          }
        }
      }
    };

    if (isInitiator) {
      // Sender creates the DataChannel
      this.dataChannel = this.pc.createDataChannel('fileTransfer', {
        ordered: true,
      });
      this.dataChannel.binaryType = 'arraybuffer';
      console.info('[WebRTC] DataChannel created (fileTransfer, ordered=true).');
    } else {
      // Receiver waits for the incoming DataChannel
      this.pc.ondatachannel = (event) => {
        console.info('[WebRTC] DataChannel received from remote peer.');
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

    if (this.pc.signalingState === 'have-local-offer' && this.pc.localDescription) {
      console.info('[WebRTC] Local offer already pending, reusing existing local description.');
      return this.pc.localDescription;
    }

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    console.info('[WEBRTC] OFFER_CREATED');
    return offer;
  }

  public async restartIce(): Promise<RTCSessionDescriptionInit | null> {
    if (!this.pc) return null;
    try {
      console.info('[WebRTC] Initiating ICE restart offer...');
      this.localIceCandidates = [];
      this.seenLocalCandidates.clear();
      this.seenRemoteCandidates.clear();
      this.pendingIceCandidates = [];
      const offer = await this.pc.createOffer({ iceRestart: true });
      await this.pc.setLocalDescription(offer);
      console.info('[WEBRTC] OFFER_CREATED (ICE restart)');
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

    console.info('[WEBRTC] OFFER_RECEIVED');
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    this.hasRemoteDescription = true;
    console.info('[WEBRTC] REMOTE_DESCRIPTION_SET');

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    console.info('[WEBRTC] ANSWER_CREATED');

    // Process all early ICE candidates that arrived before the offer was applied
    await this.processPendingCandidates();
    return answer;
  }

  public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) throw new Error('PeerConnection not initialized');

    if (this.pc.signalingState === 'stable') {
      console.info('[WebRTC] Connection signalingState is already stable. Ignoring redundant answer.');
      return;
    }

    if (this.pc.signalingState !== 'have-local-offer') {
      console.warn(`[WebRTC] Cannot apply answer in signalingState '${this.pc.signalingState}'. Ignoring.`);
      return;
    }

    console.info('[WEBRTC] ANSWER_RECEIVED');
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    this.hasRemoteDescription = true;
    console.info('[WEBRTC] REMOTE_DESCRIPTION_SET');

    // Process all early ICE candidates that arrived before the answer was applied
    await this.processPendingCandidates();
  }

  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    const candType = this.extractCandidateType(candidate.candidate);
    console.info(`[ICE] RECEIVED (type: ${candType})`);
    const sanitized = this.sanitizeCandidate(candidate);
    if (!sanitized || (!sanitized.candidate && sanitized.candidate !== '')) return;

    const key = `${sanitized.candidate}|${sanitized.sdpMid}|${sanitized.sdpMLineIndex}`;
    if (this.seenRemoteCandidates.has(key)) {
      return;
    }

    if (!this.pc || !this.hasRemoteDescription) {
      console.info('[WebRTC] Remote description not yet set, queueing early ICE candidate.');
      this.pendingIceCandidates.push(sanitized);
      return;
    }

    try {
      await this.pc.addIceCandidate(sanitized);
      this.seenRemoteCandidates.add(key);
      console.info('[ICE] ADDED');
    } catch (err) {
      console.warn('[WebRTC] Failed to add ICE candidate:', err);
    }
  }

  private async processPendingCandidates(): Promise<void> {
    if (!this.pc) return;
    const candidates = [...this.pendingIceCandidates];
    this.pendingIceCandidates = [];
    if (candidates.length > 0) {
      console.info(`[WebRTC] Processing ${candidates.length} queued early ICE candidate(s).`);
    }
    for (const rawCandidate of candidates) {
      const candidate = this.sanitizeCandidate(rawCandidate);
      if (!candidate || (!candidate.candidate && candidate.candidate !== '')) continue;
      const key = `${candidate.candidate}|${candidate.sdpMid}|${candidate.sdpMLineIndex}`;
      if (this.seenRemoteCandidates.has(key)) continue;

      try {
        await this.pc.addIceCandidate(candidate);
        this.seenRemoteCandidates.add(key);
        console.info('[ICE] ADDED (from queue)');
      } catch (err) {
        console.warn('[WebRTC] Error processing pending candidate:', err);
      }
    }
  }

  public async getConnectionDiagnostics(): Promise<ConnectionDiagnostics> {
    if (!this.pc) {
      return { connectionType: 'unknown' };
    }

    try {
      const stats = await this.pc.getStats();
      let activePair: any = null;

      stats.forEach((report) => {
        if (report.type === 'transport' && report.selectedCandidatePairId) {
          activePair = stats.get(report.selectedCandidatePairId);
        } else if (report.type === 'candidate-pair' && (report.selected || report.state === 'succeeded')) {
          activePair = report;
        }
      });

      if (activePair) {
        const localCand = stats.get(activePair.localCandidateId);
        const remoteCand = stats.get(activePair.remoteCandidateId);
        const localType = localCand?.candidateType;
        const remoteType = remoteCand?.candidateType;
        const connectionType: ConnectionDiagnostics['connectionType'] = (localType || 'unknown') as any;

        const diag: ConnectionDiagnostics = {
          connectionType,
          localCandidateType: localType,
          remoteCandidateType: remoteType,
          localProtocol: localCand?.protocol,
          bytesSent: activePair.bytesSent,
          bytesReceived: activePair.bytesReceived,
          currentRoundTripTime: activePair.currentRoundTripTime,
        };

        return diag;
      }
    } catch (err) {
      console.warn('[WebRTC Diagnostics] Failed to read connection stats:', err);
    }

    return { connectionType: 'unknown' };
  }

  public getLocalCandidates(): RTCIceCandidateInit[] {
    return [...this.localIceCandidates];
  }

  public resendLocalCandidates(sendFn: (candidate: RTCIceCandidateInit) => void): void {
    for (const cand of this.localIceCandidates) {
      try {
        const sanitized = this.sanitizeCandidate(cand);
        if (sanitized && (sanitized.candidate || sanitized.candidate === '')) {
          sendFn(sanitized);
        }
      } catch (err) {
        console.warn('[WebRTC] Error resending local candidate:', err);
      }
    }
  }

  public close(): void {
    console.info('[WebRTC] Closing WebRTC connections and channels.');
    if (this.dataChannel) {
      try {
        this.dataChannel.onopen = null;
        this.dataChannel.onclose = null;
        this.dataChannel.onerror = null;
        this.dataChannel.onmessage = null;
        if (this.dataChannel.readyState === 'open' || this.dataChannel.readyState === 'connecting') {
          this.dataChannel.close();
          console.info('[WebRTC] DataChannel closed.');
        }
      } catch {}
      this.dataChannel = null;
    }

    if (this.pc) {
      try {
        this.pc.onicecandidate = null;
        this.pc.onicegatheringstatechange = null;
        this.pc.onsignalingstatechange = null;
        this.pc.onconnectionstatechange = null;
        this.pc.oniceconnectionstatechange = null;
        this.pc.ondatachannel = null;
        this.pc.close();
        console.info('[WebRTC] RTCPeerConnection closed.');
      } catch {}
      this.pc = null;
    }

    this.pendingIceCandidates = [];
    this.localIceCandidates = [];
    this.seenLocalCandidates.clear();
    this.seenRemoteCandidates.clear();
    this.hasRemoteDescription = false;
    this.lastReportedState = null;
  }
}
