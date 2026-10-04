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
    <div className="w-full max-w-lg mx-auto simple-card p-6 sm:p-8 bg-white relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block mb-0.5">
            Transfer Ready
          </span>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Share One-Time Code</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-mono text-xs font-semibold">{timeLeft}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-6 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span>6-Digit Transfer OTP</span>
          </div>

          <div className="text-4xl sm:text-5xl font-mono font-black text-gray-900 tracking-[0.25em] my-3 select-all">
            {formattedOtp}
          </div>

          <p className="text-xs text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
            Share this code with the receiver. Once verified, direct browser-to-browser streaming will begin automatically.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => copyToClipboard(otp, 'otp')}
              className="btn-sm btn-primary gap-1.5 cursor-pointer"
            >
              {copiedOtp ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedOtp ? 'Code Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => copyToClipboard(shareUrl, 'link')}
              className="btn-sm btn-secondary gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Connection status:</span>
        <ConnectionStatus state={state} />
      </div>
    </div>
  );
};
