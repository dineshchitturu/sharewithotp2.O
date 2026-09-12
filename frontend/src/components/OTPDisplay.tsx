import React, { useState, useEffect } from 'react';
import { Check, Copy, KeyRound, Share2 } from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import type { TransferState } from '../types/transfer';

interface OTPDisplayProps {
  roomId: string;
  otp: string;
  expiresAt: string;
  state: TransferState;
}

export const OTPDisplay: React.FC<OTPDisplayProps> = ({ roomId, otp, expiresAt, state }) => {
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const remainingMs = new Date(expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const mins = Math.floor(remainingMs / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);
      setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const copyToClipboard = async (text: string, type: 'room' | 'otp' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'room') {
        setCopiedRoom(true);
        setTimeout(() => setCopiedRoom(false), 2000);
      } else if (type === 'otp') {
        setCopiedOtp(true);
        setTimeout(() => setCopiedOtp(false), 2000);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const shareText = `Secure P2P Transfer\nRoom ID: ${roomId}\nOTP: ${otp}\nConnect at: ${window.location.origin}/receive`;

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Transfer Created</span>
          <h3 className="text-lg font-bold text-white">Share With Receiver</h3>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Expires in</span>
          <span className="font-mono text-sm font-semibold text-amber-300">{timeLeft}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Room ID</span>
            <span className="text-lg font-mono font-bold text-white tracking-wide">{roomId}</span>
          </div>
          <button
            onClick={() => copyToClipboard(roomId, 'room')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {copiedRoom ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRoom ? 'Copied' : 'Copy Room ID'}</span>
          </button>
        </div>

        <div className="bg-slate-950/80 border border-sky-900/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-sky-400 uppercase tracking-wider">
              <KeyRound className="w-3 h-3" />
              <span>One-Time Password (OTP)</span>
            </div>
            <span className="text-2xl font-mono font-extrabold text-sky-300 tracking-widest">{otp}</span>
          </div>
          <button
            onClick={() => copyToClipboard(otp, 'otp')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-900/60 hover:bg-sky-800 text-sky-200 transition-colors"
          >
            {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedOtp ? 'Copied' : 'Copy OTP'}</span>
          </button>
        </div>
      </div>

      <button
        onClick={() => copyToClipboard(shareText, 'all')}
        className="w-full mb-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 transition-colors border border-slate-700"
      >
        {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-sky-400" />}
        <span>{copiedAll ? 'Copied Share Info to Clipboard!' : 'Copy Combined Share Information'}</span>
      </button>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400">Connection:</span>
        <ConnectionStatus state={state} />
      </div>
    </div>
  );
};
