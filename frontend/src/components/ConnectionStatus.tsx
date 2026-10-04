import React from 'react';
import type { TransferState } from '../types/transfer';

interface ConnectionStatusProps {
  state: TransferState;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ state }) => {
  const getBadge = () => {
    switch (state) {
      case 'CREATED':
      case 'WAITING_FOR_RECEIVER':
        return {
          dotClass: 'bg-amber-400 animate-ping',
          solidClass: 'bg-amber-500',
          textClass: 'text-amber-700 border-amber-200 bg-amber-50',
          label: 'Waiting for receiver...',
        };
      case 'RECEIVER_AUTHENTICATED':
      case 'SIGNALING':
      case 'CONNECTING':
        return {
          dotClass: 'bg-blue-400 animate-ping',
          solidClass: 'bg-blue-500',
          textClass: 'text-blue-700 border-blue-200 bg-blue-50',
          label: 'Connecting securely...',
        };
      case 'CONNECTED':
        return {
          dotClass: 'bg-emerald-400',
          solidClass: 'bg-emerald-500',
          textClass: 'text-emerald-700 border-emerald-200 bg-emerald-50',
          label: 'P2P Connected ✓',
        };
      case 'TRANSFERRING':
        return {
          dotClass: 'bg-blue-500 animate-pulse',
          solidClass: 'bg-blue-600',
          textClass: 'text-blue-700 border-blue-200 bg-blue-50',
          label: 'Transferring P2P...',
        };
      case 'VERIFYING':
        return {
          dotClass: 'bg-purple-400 animate-pulse',
          solidClass: 'bg-purple-500',
          textClass: 'text-purple-700 border-purple-200 bg-purple-50',
          label: 'Verifying SHA-256...',
        };
      case 'COMPLETED':
        return {
          dotClass: 'bg-emerald-400',
          solidClass: 'bg-emerald-500',
          textClass: 'text-emerald-700 border-emerald-200 bg-emerald-50',
          label: 'Transfer Complete ✓',
        };
      case 'DESTROYED':
        return {
          dotClass: 'bg-gray-400',
          solidClass: 'bg-gray-500',
          textClass: 'text-gray-600 border-gray-200 bg-gray-50',
          label: 'Session Destroyed',
        };
      case 'CANCELLED':
        return {
          dotClass: 'bg-rose-400',
          solidClass: 'bg-rose-500',
          textClass: 'text-rose-700 border-rose-200 bg-rose-50',
          label: 'Transfer Cancelled',
        };
      case 'EXPIRED':
        return {
          dotClass: 'bg-rose-400',
          solidClass: 'bg-rose-500',
          textClass: 'text-rose-700 border-rose-200 bg-rose-50',
          label: 'Room Expired',
        };
      case 'LOCKED':
        return {
          dotClass: 'bg-rose-400',
          solidClass: 'bg-rose-500',
          textClass: 'text-rose-700 border-rose-200 bg-rose-50',
          label: 'Session Locked (5 Failed OTPs)',
        };
      case 'FAILED':
      case 'DISCONNECTED':
      default:
        return {
          dotClass: 'bg-gray-400',
          solidClass: 'bg-gray-500',
          textClass: 'text-gray-600 border-gray-200 bg-gray-50',
          label: 'Disconnected',
        };
    }
  };

  const badge = getBadge();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium shadow-xs ${badge.textClass}`}>
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${badge.dotClass}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${badge.solidClass}`}></span>
      </span>
      <span>{badge.label}</span>
    </div>
  );
};
