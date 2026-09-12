import React, { useState } from 'react';
import { ArrowRight, KeyRound, Lock } from 'lucide-react';

interface RoomJoinerProps {
  onJoin: (roomId: string, otp: string) => Promise<void>;
  isLoading: boolean;
  attemptsRemaining?: number | null;
}

export const RoomJoiner: React.FC<RoomJoinerProps> = ({ onJoin, isLoading, attemptsRemaining }) => {
  const [roomId, setRoomId] = useState('');
  const [otp, setOtp] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRoom = roomId.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanRoom) {
      setValidationError('Please enter the Room ID.');
      return;
    }
    if (!cleanOtp || !/^\d{6}$/.test(cleanOtp)) {
      setValidationError('Please enter the 6-digit OTP code.');
      return;
    }

    setValidationError(null);
    onJoin(cleanRoom, cleanOtp);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Join Transfer</h2>
        <p className="text-sm text-slate-400">
          Enter the temporary Room ID and 6-digit OTP shared by the sender.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="joinRoomId" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Room ID
          </label>
          <input
            id="joinRoomId"
            type="text"
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
              setValidationError(null);
            }}
            placeholder="e.g. dinesh123"
            maxLength={30}
            autoFocus
            className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 font-mono text-base transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="joinOtp" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-sky-400" />
              <span>6-Digit OTP</span>
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
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
              setValidationError(null);
            }}
            placeholder="583921"
            className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 font-mono text-lg tracking-widest text-center font-bold transition-all"
          />
        </div>

        {validationError && (
          <p className="text-xs text-rose-400 mt-2">{validationError}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || !roomId.trim() || otp.length !== 6}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-medium text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-600/20"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Connect</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Lock className="w-4 h-4 text-sky-400" />
        <span>End-to-End P2P WebRTC Encryption</span>
      </div>
    </div>
  );
};
