import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  FileCheck,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatBytes } from '../utils/formatBytes';

interface TransferSuccessCardProps {
  fileName: string;
  fileSize: number;
  hashVerified?: boolean;
  computedHash?: string;
  downloadUrl?: string;
  role: 'sender' | 'receiver';
  onReset: () => void;
}

export const TransferSuccessCard: React.FC<TransferSuccessCardProps> = ({
  fileName,
  fileSize,
  hashVerified = true,
  computedHash,
  downloadUrl,
  role,
  onReset,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    // Fire confetti burst upon completion
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#34d399', '#60a5fa', '#a7f3d0'],
      });
    } catch {
      // Ignore in non-canvas test environments
    }
  }, []);

  const handleCopyHash = async () => {
    if (!computedHash) return;
    try {
      await navigator.clipboard.writeText(computedHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-emerald-500/40 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 text-center transition-all">
      {/* Animated Checkmark Badge */}
      <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
        <span className="absolute inset-0 rounded-2xl border border-emerald-400/40 animate-ping opacity-30" />
        <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-400" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 block mb-1">
        P2P Transfer Complete
      </span>
      <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
        {role === 'sender' ? 'File Delivered Successfully' : 'File Received Successfully'}
      </h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
        Direct browser stream finished. The ephemeral session has terminated with zero server footprint.
      </p>

      {/* File Card Box */}
      <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 text-left mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-bold text-white truncate" title={fileName}>
              {fileName}
            </h4>
            <span className="text-xs font-mono text-slate-400">
              {formatBytes(fileSize)}
            </span>
          </div>
        </div>

        {/* SHA-256 Verification Line */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hashVerified ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-mono text-emerald-300">
                  SHA-256 Checksum Verified ✓
                </span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-mono text-rose-300">
                  Integrity Verification Warning
                </span>
              </>
            )}
          </div>

          {computedHash && (
            <button
              onClick={handleCopyHash}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Copy full SHA-256 hash"
            >
              {copiedHash ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{copiedHash ? 'Copied' : 'Hash'}</span>
            </button>
          )}
        </div>

        {computedHash && (
          <div className="mt-2 text-[10px] font-mono text-slate-500 break-all bg-slate-900/90 p-2 rounded border border-slate-800/80">
            {computedHash}
          </div>
        )}
      </div>

      {/* Receiver Download Button */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download={fileName}
          className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] transition-all shadow-xl shadow-emerald-500/25 mb-3 text-sm sm:text-base cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>Download File ({fileName})</span>
        </a>
      )}

      {/* Reset / Transfer Another File */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700 transition-all text-xs sm:text-sm cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        <span>{role === 'sender' ? 'Send Another File' : 'Receive Another File'}</span>
      </button>
    </div>
  );
};
