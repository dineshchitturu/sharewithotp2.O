import React from 'react';
import { CheckCircle2, FileCheck, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { formatBytes } from '../utils/formatBytes';

interface TransferCompleteProps {
  fileName: string;
  fileSize: number;
  hashVerified?: boolean;
  computedHash?: string;
  onReset: () => void;
}

export const TransferComplete: React.FC<TransferCompleteProps> = ({
  fileName,
  fileSize,
  hashVerified = true,
  computedHash,
  onReset,
}) => {
  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm text-center">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
        Success
      </span>
      <h2 className="text-2xl font-black tracking-tight text-white mb-2">TRANSFER COMPLETE ✓</h2>

      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 my-6 text-left">
        <div className="flex items-center gap-3 mb-2">
          <FileCheck className="w-5 h-5 text-sky-400 shrink-0" />
          <span className="font-semibold text-white text-sm truncate">{fileName}</span>
        </div>
        <p className="text-xs font-mono text-slate-400 ml-8">{formatBytes(fileSize)}</p>

        {/* Cryptographic SHA-256 Verification Result */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
          {hashVerified ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium text-emerald-300">File integrity verified ✓</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-xs font-medium text-rose-300">✕ File integrity verification failed</span>
            </>
          )}
        </div>

        {computedHash && (
          <div className="mt-2 text-[11px] font-mono text-slate-500 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-sans">SHA-256 Digest:</span>
            {computedHash}
          </div>
        )}
      </div>

      <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3 mb-6 text-xs text-slate-400 leading-relaxed">
        The temporary transfer session and room ID have been permanently destroyed. No files were stored on the server.
      </div>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Start New Transfer</span>
      </button>
    </div>
  );
};
