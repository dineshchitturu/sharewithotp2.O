import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, ShieldCheck } from 'lucide-react';

interface RoomJoinerProps {
  onJoin: (otp: string) => Promise<void>;
  isLoading: boolean;
  attemptsRemaining?: number | null;
  initialOtp?: string;
}

export const RoomJoiner: React.FC<RoomJoinerProps> = ({
  onJoin,
  isLoading,
  attemptsRemaining,
  initialOtp = '',
}) => {
  const [otp, setOtp] = useState(initialOtp);
  const [validationError, setValidationError] = useState<string | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  useEffect(() => {
    if (initialOtp && initialOtp.length === 6) {
      setOtp(initialOtp);
    }
  }, [initialOtp]);

  const doJoin = (code: string) => {
    if (isSubmittingRef.current || isLoading) return;
    isSubmittingRef.current = true;
    onJoin(code).finally(() => {
      isSubmittingRef.current = false;
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim().replace(/\s+/g, '');

    if (!cleanOtp || !/^\d{6}$/.test(cleanOtp)) {
      setValidationError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setValidationError(null);
    doJoin(cleanOtp);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(rawVal);
    setValidationError(null);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      setOtp(pasted);
      setValidationError(null);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto glass-panel rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Subtle top edge glow */}
      <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3.5 shadow-lg shadow-cyan-950/50">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2 font-sans">
          Enter 6-Digit OTP
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
          Enter the one-time code shared from the sending device to securely unlock and stream the file.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="joinOtp" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>One-Time Password</span>
            </label>
            {attemptsRemaining !== null && attemptsRemaining !== undefined && (
              <span className="text-xs font-medium text-amber-400">
                {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining
              </span>
            )}
          </div>

          <input
            id="joinOtp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            onPaste={handlePaste}
            placeholder="• • • • • •"
            autoFocus
            className="w-full px-4 py-4 bg-[#071329]/90 border-2 border-white/15 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 rounded-2xl text-white placeholder-slate-600 focus:outline-none font-mono text-3xl sm:text-4xl tracking-[0.35em] text-center font-black transition-all shadow-inner"
          />
        </div>

        {validationError && (
          <p className="text-xs text-rose-400 font-medium text-center">{validationError}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full mt-2 btn-luminous-pill py-4 px-6 text-sm font-bold gap-2 shadow-xl shadow-cyan-500/20"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Unlock Share</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Direct Browser-to-Browser WebRTC Connection</span>
      </div>
    </div>
  );
};
