import type { TransferState } from '../types/transfer';

/**
 * Resolves the active backend API base URL:
 * 1. User-configured override in localStorage (configured via in-app Settings modal)
 * 2. Vite environment variable `VITE_API_URL`
 * 3. Default empty string '' (relative to current origin)
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('SHAREWITHOTP_BACKEND_URL');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  }

  const raw = import.meta.env.VITE_API_URL || '';
  return raw.trim().replace(/\/+$/, '');
}

export function setCustomApiBase(url: string): void {
  if (typeof window !== 'undefined') {
    const clean = url.trim().replace(/\/+$/, '');
    if (!clean) {
      localStorage.removeItem('SHAREWITHOTP_BACKEND_URL');
    } else {
      localStorage.setItem('SHAREWITHOTP_BACKEND_URL', clean);
    }
  }
}

/**
 * Determines whether a remote backend is configured or if we are in local dev.
 */
export function isBackendConfigured(): boolean {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return true;
    }
  }
  return Boolean(getApiBase());
}

export interface CreateRoomResponse {
  room_id: string;
  otp: string;
  sender_token: string;
  expires_at: string;
  status: TransferState;
}

export interface VerifyOTPResponse {
  success: boolean;
  session_token: string | null;
  status: TransferState;
  message: string;
  attempts_remaining: number | null;
}

export interface RoomStatusResponse {
  room_id: string;
  status: TransferState;
  expires_at: string;
  created_at: string;
}

/**
 * Check backend health to verify connection.
 */
export async function checkBackendHealth(targetUrl?: string): Promise<{ ok: boolean; message: string; details?: any }> {
  const base = targetUrl !== undefined ? targetUrl.trim().replace(/\/+$/, '') : getApiBase();
  const url = `${base}/api/health`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        ok: false,
        message: `Backend returned HTTP ${response.status} (${response.statusText})`,
      };
    }
    const data = await response.json();
    return {
      ok: true,
      message: 'Connected to ShareWithOTP Backend ✓',
      details: data,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Could not reach ${url}: ${err.message || 'Network error'}`,
    };
  }
}

/**
 * Safely parse HTTP responses without crashing on empty bodies, HTML 404s, or 502/504 gateways.
 */
async function safeParseResponse<T>(response: Response, endpointDescription: string): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  let parsedJson: any = null;
  if (text && contentType.includes('application/json')) {
    try {
      parsedJson = JSON.parse(text);
    } catch {
      // Fall through to text handling
    }
  }

  if (!response.ok) {
    let errorDetail = '';

    if (parsedJson) {
      errorDetail = parsedJson.detail || parsedJson.message || JSON.stringify(parsedJson);
    } else if (text) {
      errorDetail = text.length > 250 ? text.slice(0, 250) + '...' : text;
    }

    if (!errorDetail) {
      const currentBase = getApiBase();
      if (response.status === 404) {
        errorDetail = `API endpoint not found (HTTP 404). If frontend and backend are deployed separately, configure your backend URL in Server Settings. Active API base: '${currentBase || '(relative /api)'}'`;
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        errorDetail = `Backend server is waking up or temporarily unreachable (HTTP ${response.status} ${response.statusText}). Please wait 15 seconds and try again.`;
      } else {
        errorDetail = `Server returned HTTP ${response.status} (${response.statusText || 'Error'}) with empty response.`;
      }
    }

    throw new Error(errorDetail);
  }

  // Response was OK (200..299)
  if (!text || text.trim().length === 0) {
    const currentBase = getApiBase();
    throw new Error(
      `Received empty response (0 bytes) from server. Your frontend is connecting to '${currentBase || window.location.host}' instead of your FastAPI backend. Click 'Server' in the top bar to set your Backend URL.`
    );
  }

  if (parsedJson !== null) {
    return parsedJson as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Expected JSON from ${endpointDescription}, but received: ${text.slice(0, 150)}`
    );
  }
}

export async function createRoom(roomId: string): Promise<CreateRoomResponse> {
  const base = getApiBase();
  const url = `${base}/api/rooms`;
  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId }),
    });
  } catch (netErr: any) {
    throw new Error(
      `Unable to connect to backend at '${url}'. Please configure your backend URL in Server Settings.`
    );
  }

  const data = await safeParseResponse<CreateRoomResponse>(response, 'POST /api/rooms');
  if (!data || !data.room_id || !data.otp) {
    throw new Error(
      `Invalid response from backend (missing room_id or otp). Please ensure your Backend URL in Server Settings points to the FastAPI backend.`
    );
  }

  return data;
}

export async function verifyOTP(roomId: string, otp: string): Promise<VerifyOTPResponse> {
  const cleanRoomId = roomId.trim().toLowerCase();
  const base = getApiBase();
  const url = `${base}/api/rooms/${cleanRoomId}/verify`;
  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: otp.trim() }),
    });
  } catch (netErr: any) {
    throw new Error(
      `Unable to connect to backend at '${url}'. Please check your backend URL in Server Settings.`
    );
  }

  const data = await safeParseResponse<VerifyOTPResponse>(response, `POST /api/rooms/${cleanRoomId}/verify`);
  if (data.success && !data.session_token) {
    throw new Error(
      `Invalid response from backend (missing session_token). Please check your backend URL in Server Settings.`
    );
  }

  return data;
}

export async function getRoomStatus(roomId: string): Promise<RoomStatusResponse> {
  const cleanRoomId = roomId.trim().toLowerCase();
  const base = getApiBase();
  const url = `${base}/api/rooms/${cleanRoomId}/status`;
  let response: Response;

  try {
    response = await fetch(url);
  } catch (netErr: any) {
    throw new Error(`Unable to fetch room status from '${url}'.`);
  }

  return safeParseResponse<RoomStatusResponse>(response, `GET /api/rooms/${cleanRoomId}/status`);
}

export async function destroyRoom(roomId: string, token: string): Promise<void> {
  const cleanRoomId = roomId.trim().toLowerCase();
  const base = getApiBase();
  const url = `${base}/api/rooms/${cleanRoomId}/destroy?token=${encodeURIComponent(token)}`;
  try {
    await fetch(url, { method: 'POST' });
  } catch {
    // Ignore cleanup network errors
  }
}
