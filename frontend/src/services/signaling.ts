import type { SignalingMessage } from '../types/signaling';
import type { TransferState } from '../types/transfer';
import { API_BASE } from './api';

export type SignalingEventHandler = (message: SignalingMessage) => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private handlers: Set<SignalingEventHandler> = new Set();
  private heartbeatInterval: number | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
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

      let url: string;
      const explicitWsBase = import.meta.env.VITE_WS_URL;

      if (explicitWsBase) {
        const cleanWs = explicitWsBase.replace(/\/+$/, '');
        url = `${cleanWs}/ws/signaling/${encodeURIComponent(this.roomId)}?role=${this.role}&token=${encodeURIComponent(this.token)}`;
      } else if (API_BASE.startsWith('http')) {
        // Derive wss:// automatically from https://sharewithotp2-o.onrender.com
        const wsFromApi = API_BASE.replace(/^http/, 'ws');
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
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        resolve();
      };

      this.ws.onerror = (event) => {
        console.error('[Signaling] WebSocket error:', event);
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        if (event.code === 1000 || this.isIntentionallyClosed) {
          console.info('[Signaling] WebSocket closed cleanly:', event.reason);
          return;
        }
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 5000);
          this.reconnectAttempts++;
          console.warn(
            `[Signaling] WebSocket closed unexpectedly. Reconnecting attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`
          );
          this.reconnectTimer = window.setTimeout(() => {
            if (!this.isIntentionallyClosed) {
              this.connect().catch((err) => {
                console.warn('[Signaling] Reconnect failed:', err);
              });
            }
          }, delay);
        } else {
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

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
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

  public sendRequestOffer() {
    this.sendMessage({ type: 'request-offer' });
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
    // 12-second heartbeat to safely prevent Render's ~55s idle timeout
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 12000);
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
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers.clear();
  }
}
