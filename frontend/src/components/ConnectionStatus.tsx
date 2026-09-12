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
          textClass: 'text-amber-300 border-amber-500/30 bg-amber-950/40',
          label: 'Waiting for receiver...',
        };
      case 'RECEIVER_AUTHENTICATED':
      case 'SIGNALING':
      case 'CONNECTING':
        return {
          dotClass: 'bg-sky-400 animate-ping',
          solidClass: 'bg-sky-500',
          textClass: 'text-sky-300 border-sky-500/30 bg-sky-950/40',
          label: 'Connecting securely...',
        };
      case 'CONNECTED':
        return {
          dotClass: 'bg-emerald-400',
          solidClass: 'bg-emerald-500',
          textClass: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/40',
          label: 'P2P Connected ✓',
        };
      case 'TRANSFERRING':
        return {
          dotClass: 'bg-indigo-400 animate-pulse',
          solidClass: 'bg-indigo-500',
          textClass: 'text-indigo-300 border-indigo-500/30 bg-indigo-950/40',
          label: 'Transferring P2P...',
        };
      case 'VERIFYING':
        return {
          dotClass: 'bg-purple-400 animate-pulse',
          solidClass: 'bg-purple-500',
          textClass: 'text-purple-300 border-purple-500/30 bg-purple-950/40',
          label: 'Verifying SHA-256 Hash...',
        };
      case 'COMPLETED':
        return {
          dotClass: 'bg-emerald-400',
          solidClass: 'bg-emerald-500',
          textClass: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/40',
          label: 'Transfer Complete ✓',
        };
      case 'DESTROYED':
        return {
          dotClass: 'bg-slate-400',
          solidClass: 'bg-slate-500',
          textClass: 'text-slate-400 border-slate-700 bg-slate-900/60',
          label: 'Session Destroyed',
        };
      case 'CANCELLED':
        return {
          dotClass: 'bg-rose-400',
          solidClass: 'bg-rose-500',
          textClass: 'text-rose-300 border-rose-500/30 bg-rose-950/40',
          label: 'Transfer Cancelled',
        };
      case 'EXPIRED':
        return {
          dotClass: 'bg-rose-400',
          solidClass: 'bg-rose-500',
          textClass: 'text-rose-300 border-rose-500/30 bg-rose-950/40',
          label: 'Room Expired',
        };
      case 'LOCKED':
        return {
          dotClass: 'bg-rose-400',
          solidClass: 'bg-rose-500',
          textClass: 'text-rose-300 border-rose-500/30 bg-rose-950/40',
          label: 'Session Locked (5 Failed OTPs)',
        };
      case 'FAILED':
      case 'DISCONNECTED':
      default:
        return {
          dotClass: 'bg-slate-400',
          solidClass: 'bg-slate-500',
          textClass: 'text-slate-400 border-slate-700 bg-slate-900/60',
          label: 'Disconnected',
        };
    }
  };

  const badge = getBadge();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${badge.textClass}`}>
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${badge.dotClass}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${badge.solidClass}`}></span>
      </span>
      <span>{badge.label}</span>
    </div>
  );
};
