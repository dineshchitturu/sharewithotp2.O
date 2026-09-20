import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Zap, Clock, XCircle, Layers, Activity } from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import type { TransferProgress as ProgressData, TransferState } from '../types/transfer';
import { formatBytes } from '../utils/formatBytes';
import { formatSpeed } from '../utils/formatSpeed';
import { formatTime } from '../utils/formatTime';

interface TransferProgressProps {
  fileName: string;
  fileSize: number;
  progress: ProgressData | null;
  state: TransferState;
  role: 'sender' | 'receiver';
  onCancel?: () => void;
}

export const TransferProgress: React.FC<TransferProgressProps> = ({
  fileName,
  fileSize,
  progress,
  state,
  role,
  onCancel,
}) => {
  const percentage = progress?.percentage || 0;
  const transferred = progress?.bytesTransferred || 0;
  const speed = progress?.speedBytesPerSec || 0;
  const remainingSecs = progress?.remainingSeconds || 0;
  const currentChunk = progress?.currentChunk || 0;
  const totalChunks = progress?.totalChunks || 0;

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-sky-400 shadow-inner">
            {role === 'sender' ? (
              <ArrowUpCircle className="w-5 h-5 text-sky-400 animate-bounce" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-emerald-400 animate-bounce" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {role === 'sender' ? 'Direct P2P Streaming' : 'Receiving P2P Stream'}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </span>
            </div>
            <h3 className="text-base font-bold text-white truncate max-w-[220px] md:max-w-[260px]">
              {fileName}
            </h3>
          </div>
        </div>
        <ConnectionStatus state={state} />
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400">
              {percentage}%
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">
              {state === 'VERIFYING' ? 'Verifying SHA-256...' : 'streaming'}
            </span>
          </div>
          {role === 'receiver' && transferred === 0 && (
            <p className="text-[11px] text-sky-400 font-medium animate-pulse mt-0.5">
              Connecting stream buffer...
            </p>
          )}
        </div>
        <div className="text-right font-mono text-xs text-slate-400">
          <span className="text-slate-100 font-semibold">{formatBytes(transferred)}</span>
          <span className="text-slate-500"> / {formatBytes(fileSize)}</span>
        </div>
      </div>

      {/* Progress Bar Container with streaming glow */}
      <div className="relative w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner mb-6">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-150 shadow-md relative"
          style={{ width: `${Math.max(1, percentage)}%` }}
        >
          {/* Animated streaming shimmer highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>

      {/* Stream Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-sky-400 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Speed</span>
          </div>
          <span className="font-mono text-xs sm:text-sm font-bold text-slate-100 block truncate">
            {formatSpeed(speed)}
          </span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-400 uppercase font-semibold">ETA</span>
          </div>
          <span className="font-mono text-xs sm:text-sm font-bold text-slate-100 block truncate">
            {formatTime(remainingSecs)}
          </span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-teal-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Packets</span>
          </div>
          <span className="font-mono text-xs sm:text-sm font-bold text-slate-100 block truncate">
            {totalChunks > 0 ? `${currentChunk}/${totalChunks}` : `${currentChunk}`}
          </span>
        </div>
      </div>

      {/* Security & Direct Transmission Note */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 py-1 mb-4">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span>Zero Server Storage</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">64 KB SCTP Chunks</span>
      </div>

      {onCancel && state !== 'COMPLETED' && state !== 'DESTROYED' && (
        <button
          onClick={onCancel}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 border border-rose-900/40 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          <span>Cancel Transfer</span>
        </button>
      )}
    </div>
  );
};
