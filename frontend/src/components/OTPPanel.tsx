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
  const d1 = otp.slice(0, 3);
  const d2 = otp.slice(3, 6);

  return (
    <div className="w-full rounded-2xl border border-cyan-500/40 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Waiting for Receiver
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
            Share One-Time Access Code
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-amber-300">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Main 6-Digit OTP Box */}
      <div className="my-6 p-6 rounded-2xl bg-slate-950/90 border border-cyan-500/30 text-center shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 pointer-events-none" />

        <p className="text-xs text-slate-400 font-mono mb-2 uppercase tracking-wider">
          Enter this code on receiving device
        </p>

        {/* Segmented Display */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 my-3 select-all">
          <div className="text-3xl sm:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-400 tracking-widest px-3 py-1 bg-slate-900/90 rounded-xl border border-cyan-500/30">
            {d1}
          </div>
          <span className="text-2xl text-slate-600 font-mono">•</span>
          <div className="text-3xl sm:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400 tracking-widest px-3 py-1 bg-slate-900/90 rounded-xl border border-cyan-500/30">
            {d2}
          </div>
        </div>

        {fileName && (
          <p className="text-xs text-slate-400 truncate max-w-xs mx-auto mt-2">
            Streaming file: <span className="text-white font-medium">{fileName}</span>
          </p>
        )}

        {/* Copy Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => copyToClipboard(otp, 'otp')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-600/25 active:scale-95 cursor-pointer"
          >
            {copiedOtp ? (
              <Check className="w-4 h-4 text-emerald-300" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copiedOtp ? 'Code Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={() => copyToClipboard(shareUrl, 'link')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4 text-cyan-400" />
            )}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
          </button>
        </div>
      </div>

      {/* Footer Info & Cancel Option */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Single-use OTP • Status: {state}</span>
        </div>

        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors font-medium cursor-pointer"
        >
          <XCircle className="w-4 h-4" />
          <span>Cancel Transfer</span>
        </button>
      </div>
    </div>
  );
};
