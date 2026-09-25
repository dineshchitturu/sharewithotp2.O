import React from 'react';
import { ArrowDownToLine, CheckCircle2, FileCheck, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { formatBytes } from '../utils/formatBytes';

interface TransferCompleteProps {
  fileName: string;
  fileSize: number;
  hashVerified?: boolean;
  computedHash?: string;
  downloadUrl?: string;
  onReset: () => void;
}

export const TransferComplete: React.FC<TransferCompleteProps> = ({
  fileName,
  fileSize,
  hashVerified = true,
  computedHash,
  downloadUrl,
  onReset,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto glass-panel rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-center">
      {/* Subtle top edge glow */}
      <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-28 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/60">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
        Transfer Successful
      </span>
      <h2 className="text-2xl font-black tracking-tight text-white mb-2">
        Transfer Complete
      </h2>

      <div className="glass-feature-card p-4 my-6 text-left">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-sm truncate">{fileName}</span>
        </div>
        <p className="text-xs font-mono text-slate-400 ml-11">{formatBytes(fileSize)}</p>

        {/* Cryptographic SHA-256 Verification Result */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
          {hashVerified ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-emerald-300">File integrity verified (SHA-256 matched)</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-xs font-semibold text-rose-300">✕ File integrity verification warning</span>
            </>
          )}
        </div>

        {computedHash && (
          <div className="mt-2 text-[10px] font-mono text-slate-400 break-all bg-[#061022]/80 p-2.5 rounded-xl border border-white/10">
            <span className="text-cyan-400 block text-[9px] uppercase font-sans font-bold tracking-wider mb-0.5">
              SHA-256 Digest:
            </span>
            {computedHash}
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-6 text-xs text-slate-300 leading-relaxed">
        The temporary WebRTC room and one-time code have been destroyed. No file data was stored on any server.
      </div>

      {downloadUrl && (
        <a
          href={downloadUrl}
          download={fileName}
          className="w-full btn-luminous-pill py-3.5 px-6 text-sm font-bold gap-2 mb-3 shadow-lg shadow-cyan-500/20"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>Download File ({fileName})</span>
        </a>
      )}

      <button
        onClick={onReset}
        className="w-full btn-glass-pill py-3.5 px-6 text-sm font-semibold gap-2 text-white border-white/20 hover:border-white/40"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Start New Transfer</span>
      </button>
    </div>
  );
};
