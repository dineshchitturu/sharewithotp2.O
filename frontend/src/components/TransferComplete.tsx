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
    <div className="w-full max-w-lg mx-auto simple-card p-6 sm:p-8 bg-white relative overflow-hidden text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
        <CheckCircle2 className="w-7 h-7" />
      </div>

      <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 block mb-1">
        Transfer Successful
      </span>
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
        Transfer Complete
      </h2>

      <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 my-6 text-left">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900 text-sm truncate">{fileName}</span>
        </div>
        <p className="text-xs font-mono text-gray-500 ml-11">{formatBytes(fileSize)}</p>

        {/* Cryptographic SHA-256 Verification Result */}
        <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center gap-2">
          {hashVerified ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-medium text-emerald-700">File integrity verified (SHA-256 matched)</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-xs font-medium text-rose-700">✕ File integrity verification warning</span>
            </>
          )}
        </div>

        {computedHash && (
          <div className="mt-2 text-[10px] font-mono text-gray-600 break-all bg-white p-2.5 rounded-lg border border-gray-200">
            <span className="text-blue-600 block text-[9px] uppercase font-sans font-bold tracking-wider mb-0.5">
              SHA-256 Digest:
            </span>
            {computedHash}
          </div>
        )}
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 mb-6 text-xs text-gray-600 leading-relaxed">
        The temporary WebRTC session and one-time code have been destroyed. No file data was stored on any server.
      </div>

      <div className="space-y-3">
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={fileName}
            className="btn btn-primary w-full py-3.5 text-sm font-semibold gap-2 shadow-md cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Download File ({fileName})</span>
          </a>
        )}

        <button
          onClick={onReset}
          className="btn btn-secondary w-full py-3 text-sm font-semibold gap-2 cursor-pointer hover:border-gray-300"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start New Transfer</span>
        </button>
      </div>
    </div>
  );
};
