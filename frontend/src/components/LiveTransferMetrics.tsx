import { type FC } from 'react';
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

export const LiveTransferMetrics: FC<LiveTransferMetricsProps> = ({
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
    ? 'from-cyan-400 via-sky-400 to-blue-500'
    : 'from-emerald-400 via-teal-400 to-cyan-400';

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 shadow-2xl shadow-black/40 transition-all">
      {/* Top peer & file header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isSender
                ? 'bg-cyan-950/70 border-cyan-500/30 text-cyan-400 shadow-sm'
                : 'bg-emerald-950/70 border-emerald-500/30 text-emerald-400 shadow-sm'
            }`}
          >
            {isSender ? (
              <ArrowUpCircle className="w-5 h-5 animate-pulse" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-semibold block">
              {isSender ? 'Streaming Data to Peer' : 'Receiving Stream from Peer'}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-xs" title={fileName}>
              {fileName}
            </h3>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-cyan-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>{state}</span>
        </div>
      </div>

      {/* Numerical Percentage & Transferred Volume */}
      <div className="mt-5 flex items-baseline justify-between mb-1.5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-mono font-black text-white">
            {percentage}%
          </span>
          {percentage < 100 && (
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              transferring
            </span>
          )}
        </div>
        <div className="text-right font-mono text-xs text-slate-400">
          <span className="text-white font-bold">{formatBytes(transferred)}</span>
          <span className="text-slate-500"> / {formatBytes(fileSize)}</span>
        </div>
      </div>

      {/* Real-time Glowing Progress Bar */}
      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner mb-5 relative">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${accentGradient} transition-all duration-200 shadow-[0_0_8px_rgba(56,189,248,0.4)]`}
          style={{ width: `${Math.max(2, percentage)}%` }}
        />
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 font-mono">
        {/* Speed */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-slate-400 block uppercase font-medium">Speed</span>
            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate block">
              {formatSpeed(speed)}
            </span>
          </div>
        </div>

        {/* ETA */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950/70 text-indigo-400">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-slate-400 block uppercase font-medium">ETA</span>
            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate block">
              {formatTime(remainingSecs)}
            </span>
          </div>
        </div>

        {/* Chunks */}
        <div className="col-span-2 sm:col-span-1 bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950/70 text-emerald-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-slate-400 block uppercase font-medium">Chunks</span>
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
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/30 border border-rose-900/30 transition-colors cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancel Transfer</span>
        </button>
      )}
    </div>
  );
};
