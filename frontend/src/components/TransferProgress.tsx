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
    <div className="w-full max-w-lg mx-auto glass-panel rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Ambient top highlight */}
      <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
            {role === 'sender' ? (
              <ArrowUpCircle className="w-6 h-6 text-cyan-400 animate-pulse" />
            ) : (
              <ArrowDownCircle className="w-6 h-6 text-emerald-400 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {role === 'sender' ? 'Direct P2P Streaming' : 'Receiving P2P Stream'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </span>
            </div>
            <h3 className="text-base font-bold text-white truncate max-w-[220px] md:max-w-[260px] tracking-tight">
              {fileName}
            </h3>
          </div>
        </div>
        <ConnectionStatus state={state} />
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              {percentage}%
            </span>
            <span className="text-xs font-mono text-cyan-300/80 font-medium">
              {state === 'VERIFYING' ? 'Verifying SHA-256...' : 'streaming'}
            </span>
          </div>
          {role === 'receiver' && transferred === 0 && (
            <p className="text-[11px] text-cyan-400 font-medium animate-pulse mt-0.5">
              Connecting stream buffer...
            </p>
          )}
        </div>
        <div className="text-right font-mono text-xs text-slate-400">
          <span className="text-white font-bold">{formatBytes(transferred)}</span>
          <span className="text-slate-500"> / {formatBytes(fileSize)}</span>
        </div>
      </div>

      {/* Progress Bar Container with streaming glow */}
      <div className="relative w-full h-3.5 bg-[#050e1f] rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner mb-6">
        <div
          className="h-full bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 rounded-full transition-all duration-150 relative shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          style={{ width: `${Math.max(1, percentage)}%` }}
        >
          {/* Animated streaming shimmer highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>

      {/* Stream Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-feature-card p-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-cyan-400 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Speed</span>
          </div>
          <span className="font-mono text-xs sm:text-sm font-bold text-white block truncate">
            {formatSpeed(speed)}
          </span>
        </div>

        <div className="glass-feature-card p-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-indigo-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">ETA</span>
          </div>
          <span className="font-mono text-xs sm:text-sm font-bold text-white block truncate">
            {formatTime(remainingSecs)}
          </span>
        </div>

        <div className="glass-feature-card p-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-teal-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">1 MB Chunks</span>
          </div>
          <span className="font-mono text-xs sm:text-sm font-bold text-white block truncate">
            {totalChunks > 0 ? `${currentChunk}/${totalChunks}` : `${currentChunk}`}
          </span>
        </div>
      </div>

      {/* Security & Direct Transmission Note */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 py-1 mb-4">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium">Direct Browser-to-Browser</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">Zero Server Storage</span>
      </div>

      {onCancel && state !== 'COMPLETED' && state !== 'DESTROYED' && (
        <button
          onClick={onCancel}
          className="w-full btn-glass-pill py-2.5 px-4 text-xs font-semibold text-rose-300 border-rose-500/30 hover:border-rose-400/50 hover:bg-rose-950/30 gap-1.5"
        >
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>Cancel Transfer</span>
        </button>
      )}
    </div>
  );
};
