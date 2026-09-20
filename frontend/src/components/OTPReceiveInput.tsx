import { useState, useEffect, useRef, type FC, type FormEvent, type ChangeEvent, type ClipboardEvent } from 'react';
import { KeyRound, ArrowRight, ShieldCheck, AlertCircle, Clipboard } from 'lucide-react';

interface OTPReceiveInputProps {
  onJoin: (otp: string) => Promise<void>;
  isLoading: boolean;
  attemptsRemaining?: number | null;
  initialOtp?: string;
}

export const OTPReceiveInput: FC<OTPReceiveInputProps> = ({
  onJoin,
  isLoading,
  attemptsRemaining,
  initialOtp = '',
}) => {
  const [otp, setOtp] = useState<string>(() => {
    if (initialOtp && initialOtp.length === 6) {
      return initialOtp;
    }
    return '';
  });
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialOtp && initialOtp.length === 6) {
      setOtp(initialOtp);
      onJoin(initialOtp);
    } else {
      inputRef.current?.focus();
    }
  }, [initialOtp]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
    setError(null);

    if (val.length === 6 && !isLoading) {
      setTimeout(() => {
        onJoin(val);
      }, 60);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      setOtp(pasted);
      setError(null);
      if (pasted.length === 6 && !isLoading) {
        setTimeout(() => {
          onJoin(pasted);
        }, 60);
      }
    }
  };

  const handleQuickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const clean = text.replace(/\D/g, '').slice(0, 6);
      if (clean) {
        setOtp(clean);
        setError(null);
        if (clean.length === 6 && !isLoading) {
          onJoin(clean);
        }
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clean = otp.trim();
    if (clean.length !== 6) {
      setError('Please enter the 6-digit access code.');
      return;
    }
    setError(null);
    onJoin(clean);
  };

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 shadow-2xl shadow-black/40 transition-all">
      <div className="text-center mb-5">
        <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/80 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-md">
          <KeyRound className="w-5 h-5" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Enter 6-Digit Code
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
          Enter the access code provided by the sender to connect directly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Single continuous input field (NOT divided into segments) */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={handleChange}
            onPaste={handlePaste}
            disabled={isLoading}
            placeholder="000000"
            aria-label="6-digit access code"
            className="w-full h-14 sm:h-16 px-4 bg-slate-950/90 border border-slate-700/80 hover:border-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 rounded-xl font-mono text-2xl sm:text-3xl text-center text-white font-bold tracking-[0.3em] placeholder:text-slate-700 placeholder:tracking-[0.3em] focus:outline-none transition-all shadow-inner"
          />

          {/* Quick paste button on right if empty */}
          {!otp && (
            <button
              type="button"
              onClick={handleQuickPaste}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Paste from clipboard"
            >
              <Clipboard className="w-4 h-4" />
            </button>
          )}
        </div>

        {attemptsRemaining !== null && attemptsRemaining !== undefined && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining
            </span>
          </div>
        )}

        {error && (
          <p className="text-xs text-rose-400 font-medium text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-400/20 text-sm cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
          ) : (
            <>
              <span>Connect & Receive File</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Direct WebRTC P2P • Zero Server Retention</span>
      </div>
    </div>
  );
};
