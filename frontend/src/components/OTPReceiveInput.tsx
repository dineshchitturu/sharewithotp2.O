import { useState, useEffect, useRef, Fragment, type FC } from 'react';
import { KeyRound, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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
  const [digits, setDigits] = useState<string[]>(() => {
    if (initialOtp && initialOtp.length === 6) {
      return initialOtp.split('');
    }
    return ['', '', '', '', '', ''];
  });
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialOtp && initialOtp.length === 6) {
      const arr = initialOtp.split('');
      setDigits(arr);
      onJoin(initialOtp);
    } else {
      // Focus the first input box
      inputRefs.current[0]?.focus();
    }
  }, [initialOtp]);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    const char = cleaned[cleaned.length - 1];
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError(null);

    // Auto-focus next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits are filled
    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !isLoading) {
      setTimeout(() => {
        onJoin(fullCode);
      }, 80);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    setError(null);

    if (pasted.length === 6 && !isLoading) {
      setTimeout(() => {
        onJoin(pasted);
      }, 80);
    } else {
      const nextEmpty = newDigits.findIndex((d) => !d);
      if (nextEmpty !== -1) {
        inputRefs.current[nextEmpty]?.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }
    setError(null);
    onJoin(fullCode);
  };

  const fullOtp = digits.join('');

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-emerald-500/30 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 transition-all">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
          <KeyRound className="w-7 h-7" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Enter 6-Digit Transfer Code
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
          Ask the sender for their 6-digit access code to connect directly and start streaming.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Segmented Digit Inputs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <Fragment key={idx}>
              <input
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isLoading}
                aria-label={`Digit ${idx + 1}`}
                className="w-11 h-14 sm:w-13 sm:h-16 text-center font-mono font-black text-2xl sm:text-3xl text-emerald-300 bg-slate-950/90 border-2 border-slate-700 hover:border-slate-500 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 rounded-xl focus:outline-none transition-all duration-150 selection:bg-transparent"
              />
              {idx === 2 && (
                <span className="text-slate-600 font-mono text-xl font-bold select-none">
                  •
                </span>
              )}
            </Fragment>
          ))}
        </div>

        {attemptsRemaining !== null && attemptsRemaining !== undefined && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining before lock
            </span>
          </div>
        )}

        {error && (
          <p className="text-xs text-rose-400 font-medium text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || fullOtp.length !== 6}
          className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-emerald-500/20 text-sm sm:text-base cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Connect & Receive File</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Direct WebRTC DataChannel • Zero Server Retention</span>
      </div>
    </div>
  );
};
