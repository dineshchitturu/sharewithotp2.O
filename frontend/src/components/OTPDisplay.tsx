import React, { useState, useEffect } from 'react';
import { Check, Copy, KeyRound, Share2 } from 'lucide-react';
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
    <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Transfer Ready</span>
          <h3 className="text-lg font-bold text-white">Share One-Time Code</h3>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Expires in</span>
          <span className="font-mono text-sm font-semibold text-amber-300">{timeLeft}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-slate-950/90 border-2 border-sky-500/40 rounded-2xl p-6 text-center shadow-inner">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
            <KeyRound className="w-4 h-4" />
            <span>6-Digit Transfer OTP</span>
          </div>

          <div className="text-4xl sm:text-5xl font-mono font-extrabold text-white tracking-widest my-2 select-all">
            {formattedOtp}
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Share this code with the receiver. Once verified, direct P2P streaming will begin.
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => copyToClipboard(otp, 'otp')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md shadow-sky-600/20"
            >
              {copiedOtp ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedOtp ? 'Code Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => copyToClipboard(shareUrl, 'link')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-sky-400" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400">Receiver Status:</span>
        <ConnectionStatus state={state} />
      </div>
    </div>
  );
};
