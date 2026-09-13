import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface RoomCreatorProps {
  onCreate: (roomId: string) => Promise<void>;
  isLoading: boolean;
  hasSelectedFile?: boolean;
}

export const RoomCreator: React.FC<RoomCreatorProps> = ({ onCreate, isLoading, hasSelectedFile = true }) => {
  const [roomId, setRoomId] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const generateRandomRoomId = () => {
    const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomId(result);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = roomId.trim().toLowerCase();

    if (!hasSelectedFile) {
      setValidationError('Please select a file to share first before creating a room.');
      return;
    }

    if (!clean) {
      setValidationError('Please enter a temporary Room ID.');
      return;
    }
    if (clean.length < 4 || clean.length > 30) {
      setValidationError('Room ID must be between 4 and 30 characters.');
      return;
    }
    if (!/^[a-z0-9_-]+$/.test(clean)) {
      setValidationError('Only lowercase letters, numbers, hyphens, and underscores are allowed.');
      return;
    }

    setValidationError(null);
    onCreate(clean);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Create Transfer</h2>
        <p className="text-sm text-slate-400">
          Choose a temporary identifier for this transfer session.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="roomId" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Temporary Room ID
            </label>
            <button
              type="button"
              onClick={generateRandomRoomId}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Generate random
            </button>
          </div>

          <div className="relative">
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
                setValidationError(null);
              }}
              placeholder="e.g. dinesh123"
              maxLength={30}
              autoFocus
              className="w-full px-4 py-3.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 font-mono text-base transition-all"
            />
          </div>

          {validationError && (
            <p className="mt-2 text-xs text-rose-400">{validationError}</p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            4-30 characters: letters, numbers, underscores, or hyphens.
          </p>
        </div>

        {!hasSelectedFile && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 text-center">
            ⚠ Please choose a file above first to create a transfer room.
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !roomId.trim() || !hasSelectedFile}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-medium text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-600/20"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Transfer</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Temporary session destroyed immediately after transfer.</span>
      </div>
    </div>
  );
};
