export type TransferState =
  | 'CREATED'
  | 'WAITING_FOR_RECEIVER'
  | 'RECEIVER_AUTHENTICATED'
  | 'SIGNALING'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'TRANSFERRING'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'DESTROYED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'FAILED'
  | 'DISCONNECTED'
  | 'LOCKED';

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  totalChunks: number;
  chunkSize: number;
  expectedHash?: string;
}

export interface TransferProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  speedBytesPerSec: number;
  remainingSeconds: number;
  currentChunk: number;
  totalChunks: number;
}

export interface RoomDetails {
  roomId: string;
  otp?: string;
  senderToken?: string;
  receiverToken?: string;
  expiresAt: string;
  state: TransferState;
}
