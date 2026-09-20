import {
  useState,
  useEffect,
  useRef,
  type FC,
  type FormEvent,
  type KeyboardEvent,
  type ClipboardEvent,
  type ChangeEvent,
} from 'react';
import { Send, Download, Lock, AlertCircle } from 'lucide-react';

interface OTPReceiveInputProps {
  onJoin: (otp: string) => Promise<void>;
  isLoading: boolean;
  attemptsRemaining?: number | null;
  initialOtp?: string;
  onSelectMode?: (mode: 'send' | 'receive') => void;
}

export const OTPReceiveInput: FC<OTPReceiveInputProps> = ({
  onJoin,
  isLoading,
  attemptsRemaining,
  initialOtp = '',
  onSelectMode,
}) => {
  const [digits, setDigits] = useState<string[]>(() => {
    if (initialOtp && initialOtp.length === 6) {
      return initialOtp.split('').slice(0, 6);
    }
    return ['', '', '', '', '', ''];
  });
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialOtp && initialOtp.length === 6) {
      const splitDigits = initialOtp.split('').slice(0, 6);
      setDigits(splitDigits);
      onJoin(initialOtp);
    } else {
      inputRefs.current[0]?.focus();
    }
  }, [initialOtp]);

  const otpValue = digits.join('');

  const handleInputChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      setError(null);
      return;
    }

    // Handle single digit entered
    const char = rawVal[rawVal.length - 1];
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError(null);

    // Auto-advance to next slot
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
        e.preventDefault();
      } else if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    setError(null);

    const nextFocus = Math.min(pasted.length, 5);
    inputRefs.current[nextFocus]?.focus();
    setFocusedIndex(nextFocus);

    if (pasted.length === 6 && !isLoading) {
      onJoin(pasted);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clean = digits.join('').trim();
    if (clean.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setError(null);
    onJoin(clean);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-slate-800/80 bg-[#0c1017]/95 backdrop-blur-2xl p-5 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] transition-all">
      {/* Top Send / Receive Segmented Tabs (matches reference design) */}
      <div className="w-full bg-[#121620] p-1 rounded-2xl border border-slate-800/80 flex items-center mb-7 sm:mb-8">
        <button
          type="button"
          onClick={() => onSelectMode?.('send')}
          className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-slate-400 hover:text-slate-200 text-xs sm:text-sm font-medium transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 -rotate-45" />
          <span>Send</span>
        </button>

        <div className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl bg-[#1c2333] border border-slate-700/60 text-white text-xs sm:text-sm font-medium shadow-md">
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Receive</span>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2 font-sans">
          Enter the 6-digit OTP
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
          Enter the code from your other device to retrieve the content
        </p>
      </div>

      {/* 6-Digit Rounded Input Slots */}
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 w-full">
          {digits.map((digit, idx) => {
            const isFocused = focusedIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => {
                  inputRefs.current[idx]?.focus();
                  setFocusedIndex(idx);
                }}
                className={`w-11 h-14 sm:w-13 sm:h-16 rounded-2xl flex items-center justify-center relative cursor-text select-none transition-all ${
                  isFocused
                    ? 'border-2 border-cyan-400/90 shadow-[0_0_18px_rgba(56,189,248,0.4)] bg-[#101726]'
                    : 'border border-slate-800/80 bg-[#121824]/90 hover:border-slate-700'
                }`}
              >
                <input
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(idx, e)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  onFocus={() => setFocusedIndex(idx)}
                  disabled={isLoading}
                  className="w-full h-full text-center bg-transparent text-white font-mono text-xl sm:text-2xl font-bold focus:outline-none caret-transparent"
                />

                {/* Vertical blinking cursor if empty and focused (matches reference image) */}
                {isFocused && !digit && (
                  <span className="absolute pointer-events-none w-0.5 h-6 bg-cyan-400 rounded-full animate-cursor-blink" />
                )}
              </div>
            );
          })}
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

        {/* Primary Action Button: Unlock Share */}
        <button
          type="submit"
          disabled={isLoading || otpValue.length !== 6}
          className="flex items-center justify-center gap-2 py-3 px-8 rounded-2xl font-medium text-sm text-blue-100 bg-[#2b5997] hover:bg-[#356bb4] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-950/50 transition-all cursor-pointer min-w-[160px]"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-blue-200/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Unlock Share</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
