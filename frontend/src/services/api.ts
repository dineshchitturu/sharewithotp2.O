import type { TransferState } from '../types/transfer';

// Deployed backend URL
const DEPLOYED_BACKEND_URL = 'https://sharewithotp2-o.onrender.com';

// Automatically resolve API Base:
// 1. Explicit VITE_API_URL if set
// 2. In local development (localhost / 127.0.0.1), use relative '' (proxied by Vite)
// 3. In production deployment, automatically use DEPLOYED_BACKEND_URL
export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : DEPLOYED_BACKEND_URL)
).replace(/\/+$/, '');

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

export async function createRoom(roomId: string): Promise<CreateRoomResponse> {
  const url = `${API_BASE}/api/rooms`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id: roomId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to create temporary room.');
  }

  return data;
}

export async function verifyOTP(roomId: string, otp: string): Promise<VerifyOTPResponse> {
  const cleanRoomId = roomId.trim().toLowerCase();
  const url = `${API_BASE}/api/rooms/${cleanRoomId}/verify`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp: otp.trim() }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Verification failed.');
  }

  return data;
}

export async function getRoomStatus(roomId: string): Promise<RoomStatusResponse> {
  const cleanRoomId = roomId.trim().toLowerCase();
  const url = `${API_BASE}/api/rooms/${cleanRoomId}/status`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Could not fetch room status.');
  }
  return data;
}

export async function destroyRoom(roomId: string, token: string): Promise<void> {
  const cleanRoomId = roomId.trim().toLowerCase();
  const url = `${API_BASE}/api/rooms/${cleanRoomId}/destroy?token=${encodeURIComponent(token)}`;
  try {
    await fetch(url, { method: 'POST' });
  } catch {
    // Ignore cleanup network errors
  }
}
