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
    <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2 font-sans">
          Enter the 6-digit OTP
        </h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
          Enter the code from your other device to retrieve the content
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="joinOtp" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-sky-400" />
              <span>Enter 6-Digit Code</span>
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
            className="w-full px-4 py-4 bg-slate-950/90 border-2 border-slate-700 hover:border-slate-600 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none font-mono text-3xl tracking-[0.4em] text-center font-extrabold transition-all"
          />
        </div>

        {validationError && (
          <p className="text-xs text-rose-400 font-medium text-center">{validationError}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full mt-2 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-600/20 text-sm cursor-pointer"
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

      <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Direct Browser-to-Browser WebRTC Connection</span>
      </div>
    </div>
  );
};
