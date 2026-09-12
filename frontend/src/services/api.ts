import type { TransferState } from '../types/transfer';

const API_BASE = import.meta.env.VITE_API_URL || '';

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
  const response = await fetch(`${API_BASE}/api/rooms`, {
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
  const response = await fetch(`${API_BASE}/api/rooms/${cleanRoomId}/verify`, {
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
  const response = await fetch(`${API_BASE}/api/rooms/${cleanRoomId}/status`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Could not fetch room status.');
  }
  return data;
}

export async function destroyRoom(roomId: string, token: string): Promise<void> {
  const cleanRoomId = roomId.trim().toLowerCase();
  await fetch(`${API_BASE}/api/rooms/${cleanRoomId}/destroy?token=${encodeURIComponent(token)}`, {
    method: 'POST',
  });
}
