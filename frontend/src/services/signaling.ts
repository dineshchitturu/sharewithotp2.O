import type { SignalingMessage } from '../types/signaling';
import type { TransferState } from '../types/transfer';
import { getApiBase } from './api';

export type SignalingEventHandler = (message: SignalingMessage) => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private handlers: Set<SignalingEventHandler> = new Set();
  private heartbeatInterval: number | null = null;
  private isIntentionallyClosed: boolean = false;
  private roomId: string;
  private role: 'sender' | 'receiver';
  private token: string;

  constructor(
    roomId: string,
    role: 'sender' | 'receiver',
    token: string
  ) {
    this.roomId = roomId;
    this.role = role;
    this.token = token;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isIntentionallyClosed = false;

      const explicitWsBase = import.meta.env.VITE_WS_URL;
      const apiBase = getApiBase();
      let url: string;

      if (explicitWsBase) {
        const cleanWs = explicitWsBase.replace(/\/+$/, '');
        url = `${cleanWs}/ws/signaling/${encodeURIComponent(this.roomId)}?role=${this.role}&token=${encodeURIComponent(this.token)}`;
      } else if (apiBase) {
        const wsFromApi = apiBase.replace(/^http/, 'ws');
        url = `${wsFromApi}/ws/signaling/${encodeURIComponent(this.roomId)}?role=${this.role}&token=${encodeURIComponent(this.token)}`;
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        url = `${protocol}//${window.location.host}/ws/signaling/${encodeURIComponent(this.roomId)}?role=${this.role}&token=${encodeURIComponent(this.token)}`;
      }

      try {
        this.ws = new WebSocket(url);
      } catch (err) {
        reject(err);
        return;
      }

      this.ws.onopen = () => {
        this.startHeartbeat();
        resolve();
      };

      this.ws.onerror = (event) => {
        console.error('[Signaling] WebSocket error:', event);
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        if (!this.isIntentionallyClosed) {
          this.emit({
            type: 'error',
            message: event.reason || `WebSocket closed (code: ${event.code})`,
          });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: SignalingMessage = JSON.parse(event.data);
          this.emit(msg);
        } catch {
          console.error('[Signaling] Failed to parse message JSON:', event.data);
        }
      };
    });
  }

  public onMessage(handler: SignalingEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private emit(message: SignalingMessage) {
    for (const handler of this.handlers) {
      try {
        handler(message);
      } catch (err) {
        console.error('[Signaling] Handler error:', err);
      }
    }
  }

  public sendMessage(msg: SignalingMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      console.warn('[Signaling] Cannot send message, WebSocket not open.');
    }
  }

  public sendOffer(sdp: RTCSessionDescriptionInit) {
    this.sendMessage({ type: 'offer', payload: sdp });
  }

  public sendAnswer(sdp: RTCSessionDescriptionInit) {
    this.sendMessage({ type: 'answer', payload: sdp });
  }

  public sendCandidate(candidate: RTCIceCandidateInit) {
    this.sendMessage({ type: 'ice-candidate', payload: candidate });
  }

  public sendStateUpdate(state: TransferState) {
    this.sendMessage({ type: 'state-update', state });
  }

  public sendComplete() {
    this.sendMessage({ type: 'transfer-complete' });
  }

  public sendCancel(reason: string) {
    this.sendMessage({ type: 'transfer-cancelled', reason });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 20000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public close() {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers.clear();
  }
}
