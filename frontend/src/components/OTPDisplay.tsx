import React, { useState, useEffect } from 'react';
import { Check, Copy, KeyRound, Share2, Clock } from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import type { TransferState } from '../types/transfer';

interface OTPDisplayProps {
  otp: string;
  expiresAt: string;
  state: TransferState;
  roomId?: string;
}

export const OTPDisplay: React.FC<OTPDisplayProps> = ({ otp, expiresAt, state }) => {
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
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

  const copyToClipboard = async (text: string, type: 'otp' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'otp') {
        setCopiedOtp(true);
        setTimeout(() => setCopiedOtp(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const shareUrl = `${window.location.origin}/?otp=${otp}`;

  // Format 6-digit OTP with a space in middle for easy readability: e.g. 123 456
  const formattedOtp = otp.length === 6 ? `${otp.slice(0, 3)} ${otp.slice(3)}` : otp;

  return (
    <div className="w-full max-w-lg mx-auto glass-panel rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Ambient top highlight */}
      <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block mb-0.5">
            Transfer Ready
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">Share One-Time Code</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-xs font-semibold">{timeLeft}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-[#071329]/80 border border-cyan-500/30 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden">
          {/* Subtle glow orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-cyan-500/10 blur-2xl pointer-events-none" />

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase tracking-widest mb-2 relative z-10">
            <KeyRound className="w-3.5 h-3.5" />
            <span>6-Digit Transfer OTP</span>
          </div>

          <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-[0.25em] my-3 select-all relative z-10 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            {formattedOtp}
          </div>

          <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed relative z-10">
            Share this code with the receiver. Once verified, direct P2P streaming will begin automatically.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 relative z-10">
            <button
              onClick={() => copyToClipboard(otp, 'otp')}
              className="btn-luminous-pill text-xs px-4 py-2.5 gap-2"
            >
              {copiedOtp ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copiedOtp ? 'Code Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => copyToClipboard(shareUrl, 'link')}
              className="btn-glass-pill text-xs px-4 py-2.5 gap-2 text-cyan-200 border-cyan-400/30 hover:bg-cyan-950/40"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4 text-cyan-300" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Receiver Status:</span>
        <ConnectionStatus state={state} />
      </div>
    </div>
  );
};
