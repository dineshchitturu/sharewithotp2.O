import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Zap, Clock, XCircle, Layers } from 'lucide-react';
import type { TransferProgress as ProgressData, TransferState } from '../types/transfer';
import { formatBytes } from '../utils/formatBytes';
import { formatSpeed } from '../utils/formatSpeed';
import { formatTime } from '../utils/formatTime';

interface LiveTransferMetricsProps {
  fileName: string;
  fileSize: number;
  progress: ProgressData | null;
  state: TransferState;
  role: 'sender' | 'receiver';
  onCancel?: () => void;
}

export const LiveTransferMetrics: React.FC<LiveTransferMetricsProps> = ({
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

  const isSender = role === 'sender';
  const accentGradient = isSender
    ? 'from-cyan-500 via-sky-400 to-blue-500'
    : 'from-emerald-400 via-teal-400 to-cyan-400';

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-cyan-500/30 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 transition-all">
      {/* Top peer & file header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              isSender
                ? 'bg-cyan-950/70 border-cyan-500/30 text-cyan-400 shadow-md shadow-cyan-500/10'
                : 'bg-emerald-950/70 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/10'
            }`}
          >
            {isSender ? (
              <ArrowUpCircle className="w-6 h-6 animate-pulse" />
            ) : (
              <ArrowDownCircle className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-semibold block">
              {isSender ? 'Streaming Data to Peer' : 'Receiving Stream from Peer'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-[220px] sm:max-w-xs" title={fileName}>
              {fileName}
            </h3>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{state}</span>
        </div>
      </div>

      {/* Numerical Percentage & Transferred Volume */}
      <div className="mt-6 flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-mono font-black text-white">
            {percentage}%
          </span>
          {percentage < 100 && (
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              in transit
            </span>
          )}
        </div>
        <div className="text-right font-mono text-xs sm:text-sm text-slate-400">
          <span className="text-white font-bold">{formatBytes(transferred)}</span>
          <span className="text-slate-500"> / {formatBytes(fileSize)}</span>
        </div>
      </div>

      {/* Real-time Glowing Progress Bar */}
      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner mb-6 relative">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${accentGradient} transition-all duration-200 shadow-[0_0_12px_rgba(56,189,248,0.5)]`}
          style={{ width: `${Math.max(2, percentage)}%` }}
        />
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 font-mono">
        {/* Speed */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Speed</span>
            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate block">
              {formatSpeed(speed)}
            </span>
          </div>
        </div>

        {/* ETA */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-950/80 text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">ETA</span>
            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate block">
              {formatTime(remainingSecs)}
            </span>
          </div>
        </div>

        {/* Chunks */}
        <div className="col-span-2 sm:col-span-1 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Chunks</span>
            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate block">
              {currentChunk} / {totalChunks || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Cancel Option */}
      {onCancel && state !== 'COMPLETED' && state !== 'DESTROYED' && (
        <button
          onClick={onCancel}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/30 border border-rose-900/40 transition-colors cursor-pointer"
        >
          <XCircle className="w-4 h-4" />
          <span>Abort Transfer</span>
        </button>
      )}
    </div>
  );
};
