import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Zap, Clock, XCircle, Layers } from 'lucide-react';
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
    <div className="w-full max-w-lg mx-auto simple-card p-6 sm:p-8 bg-white relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            {role === 'sender' ? (
              <ArrowUpCircle className="w-5 h-5 text-blue-600 animate-pulse" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-emerald-600 animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {role === 'sender' ? 'Direct P2P Streaming' : 'Receiving P2P Stream'}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 truncate max-w-[200px] sm:max-w-[240px] tracking-tight">
              {fileName}
            </h3>
          </div>
        </div>
        <ConnectionStatus state={state} />
      </div>

      <div className="flex items-end justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-mono font-black text-gray-900">
            {percentage}%
          </span>
          <span className="text-xs font-mono text-gray-500 font-medium">
            {state === 'VERIFYING' ? 'Verifying SHA-256...' : 'streaming'}
          </span>
        </div>
        <div className="text-right font-mono text-xs text-gray-500">
          <span className="text-gray-900 font-bold">{formatBytes(transferred)}</span>
          <span className="text-gray-400"> / {formatBytes(fileSize)}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200 mb-6">
        <div
          className="h-full bg-linear-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-150 relative shadow-sm"
          style={{ width: `${Math.max(1, percentage)}%` }}
        />
      </div>

      {/* Stream Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 border border-gray-200/70 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
            <Zap className="w-3 h-3 text-blue-600" />
            <span>Speed</span>
          </div>
          <p className="font-mono text-xs font-bold text-gray-900 truncate">
            {formatSpeed(speed)}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200/70 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Remaining</span>
          </div>
          <p className="font-mono text-xs font-bold text-gray-900 truncate">
            {formatTime(remainingSecs)}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200/70 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
            <Layers className="w-3 h-3 text-purple-600" />
            <span>Chunks</span>
          </div>
          <p className="font-mono text-xs font-bold text-gray-900 truncate">
            {currentChunk}/{totalChunks}
          </p>
        </div>
      </div>

      {onCancel && (
        <div className="pt-2 text-center">
          <button
            onClick={onCancel}
            className="btn-sm bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 gap-1.5 cursor-pointer transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Transfer</span>
          </button>
        </div>
      )}
    </div>
  );
};
