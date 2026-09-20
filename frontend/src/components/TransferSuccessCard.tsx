import { useEffect, useState, type FC } from 'react';
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

export const TransferSuccessCard: FC<TransferSuccessCardProps> = ({
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
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#34d399', '#60a5fa', '#a7f3d0'],
      });
    } catch {}
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
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 shadow-2xl shadow-black/40 text-center transition-all">
      {/* Checkmark Badge */}
      <div className="relative mx-auto w-12 h-12 sm:w-14 sm:h-14 mb-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
      </div>

      <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-emerald-400 block mb-1">
        Transfer Complete
      </span>
      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
        {role === 'sender' ? 'File Delivered' : 'File Received'}
      </h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
        P2P stream finished cleanly. Zero server retention.
      </p>

      {/* File Card Box */}
      <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 text-left mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-semibold text-white truncate" title={fileName}>
              {fileName}
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              {formatBytes(fileSize)}
            </span>
          </div>
        </div>

        {/* SHA-256 Verification Line */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {hashVerified ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-mono text-emerald-300">
                  SHA-256 Verified ✓
                </span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-[11px] font-mono text-rose-300">
                  Integrity Warning
                </span>
              </>
            )}
          </div>

          {computedHash && (
            <button
              onClick={handleCopyHash}
              className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
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
          <div className="mt-2 text-[9px] font-mono text-slate-500 break-all bg-slate-900/90 p-1.5 rounded border border-slate-800/80">
            {computedHash}
          </div>
        )}
      </div>

      {/* Receiver Download Button */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download={fileName}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] transition-all shadow-lg shadow-emerald-400/20 mb-2.5 text-xs sm:text-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download File ({fileName})</span>
        </a>
      )}

      {/* Reset / Transfer Another File */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 transition-all text-xs cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{role === 'sender' ? 'Send Another File' : 'Receive Another File'}</span>
      </button>
    </div>
  );
};
