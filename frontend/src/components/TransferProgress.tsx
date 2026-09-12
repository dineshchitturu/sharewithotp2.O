import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Zap, Clock, XCircle } from 'lucide-react';
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

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400">
            {role === 'sender' ? (
              <ArrowUpCircle className="w-5 h-5" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {role === 'sender' ? 'Sending Direct P2P' : 'Receiving Direct P2P'}
            </span>
            <h3 className="text-base font-bold text-white truncate max-w-[240px] md:max-w-[280px]">
              {fileName}
            </h3>
          </div>
        </div>
        <ConnectionStatus state={state} />
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <span className="text-3xl font-mono font-extrabold text-white">{percentage}%</span>
        </div>
        <div className="text-right font-mono text-xs text-slate-400">
          <span className="text-slate-200 font-semibold">{formatBytes(transferred)}</span>
          <span> / {formatBytes(fileSize)}</span>
        </div>
      </div>

      <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 mb-6">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-200 shadow-sm"
          style={{ width: `${Math.max(1, percentage)}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-950/60 text-sky-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-medium">Speed</span>
            <span className="font-mono text-sm font-bold text-slate-100">
              {formatSpeed(speed)}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-medium">Remaining</span>
            <span className="font-mono text-sm font-bold text-slate-100">
              {formatTime(remainingSecs)}
            </span>
          </div>
        </div>
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
