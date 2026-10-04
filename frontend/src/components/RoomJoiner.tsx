import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, ShieldCheck, ArrowRight } from 'lucide-react';

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
      doJoin(initialOtp);
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
    if (rawVal.length === 6) {
      doJoin(rawVal);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      setOtp(pasted);
      setValidationError(null);
      if (pasted.length === 6) {
        doJoin(pasted);
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto simple-card p-6 sm:p-8 bg-white relative overflow-hidden">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1.5">
          Enter 6-Digit OTP
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
          Enter the one-time code shared from the sending device to securely unlock and stream the file.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="joinOtp" className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>One-Time Password</span>
            </label>
            {attemptsRemaining !== null && attemptsRemaining !== undefined && (
              <span className="text-xs font-medium text-amber-600">
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
            disabled={isLoading}
            className="w-full text-center text-3xl sm:text-4xl font-mono font-black tracking-[0.3em] py-3.5 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-300 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-xs"
          />

          {validationError && (
            <p className="text-xs text-rose-500 mt-2 font-medium text-center">
              {validationError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="btn btn-primary w-full py-3.5 text-sm font-semibold gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Unlock & Receive File</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Volatile memory hash verification • No server storage</span>
      </div>
    </div>
  );
};
