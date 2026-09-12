import type { TransferState } from './transfer';

export type SignalingMessageType =
  | 'connection-success'
  | 'peer-joined'
  | 'peer-left'
  | 'offer'
  | 'answer'
  | 'ice-candidate'
  | 'state-update'
  | 'transfer-complete'
  | 'transfer-cancelled'
  | 'ping'
  | 'pong'
  | 'error';

export interface SignalingMessage {
  type: SignalingMessageType;
  payload?: any;
  sender_role?: 'sender' | 'receiver';
  role?: 'sender' | 'receiver';
  room_id?: string;
  status?: TransferState;
  state?: TransferState;
  reason?: string;
  message?: string;
}
