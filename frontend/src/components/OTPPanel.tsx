import { useState, useEffect, type FC } from 'react';
import { Check, Copy, Share2, Clock, XCircle, ShieldCheck } from 'lucide-react';
import type { TransferState } from '../types/transfer';

interface OTPPanelProps {
  otp: string;
  expiresAt: string;
  state: TransferState;
  fileName?: string;
  onCancel: () => void;
}

export const OTPPanel: FC<OTPPanelProps> = ({
  otp,
  expiresAt,
  state,
  fileName,
  onCancel,
}) => {
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('15:00');

  useEffect(() => {
    const updateCountdown = () => {
      if (!expiresAt) return;
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
      console.error('Failed to copy', err);
    }
  };

  const shareUrl = `${window.location.origin}/?otp=${otp}`;

  return (
    <div className="w-full rounded-2xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 shadow-2xl shadow-black/40 transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Waiting for Receiver
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
            One-Time Access Code
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-amber-300">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Main Single Continuous 6-Digit OTP Box (NOT segmented into 3 digits) */}
      <div className="my-5 p-5 sm:p-6 rounded-xl bg-slate-950/90 border border-slate-800/90 text-center shadow-inner relative">
        <p className="text-[11px] text-slate-400 font-mono mb-2 uppercase tracking-wider">
          Enter this 6-digit code on receiving device
        </p>

        {/* Single continuous unsegmented code container */}
        <div className="my-2 py-3 px-4 bg-slate-900/90 rounded-xl border border-slate-700/80 select-all inline-block min-w-[240px]">
          <span className="text-3xl sm:text-5xl font-mono font-black text-white tracking-[0.25em] pl-[0.25em] block">
            {otp}
          </span>
        </div>

        {fileName && (
          <p className="text-xs text-slate-400 truncate max-w-xs mx-auto mt-2">
            File: <span className="text-slate-200 font-medium">{fileName}</span>
          </p>
        )}

        {/* Stripe-style actions */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => copyToClipboard(otp, 'otp')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer font-sans"
          >
            {copiedOtp ? (
              <Check className="w-4 h-4 text-slate-950" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copiedOtp ? 'Code Copied' : 'Copy Code'}</span>
          </button>

          <button
            onClick={() => copyToClipboard(shareUrl, 'link')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 cursor-pointer font-sans"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4 text-slate-400" />
            )}
            <span>{copiedLink ? 'Link Copied' : 'Copy Direct Link'}</span>
          </button>
        </div>
      </div>

      {/* Footer Info & Cancel Option */}
      <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Status: {state}</span>
        </div>

        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors font-medium cursor-pointer text-xs"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
};
