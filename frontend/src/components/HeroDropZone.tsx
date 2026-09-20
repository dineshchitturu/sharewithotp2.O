import { useRef, useState, type FC, type DragEvent, type ChangeEvent, type KeyboardEvent } from 'react';
import { UploadCloud, FileCheck, Zap, ArrowUpRight } from 'lucide-react';

interface HeroDropZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export const HeroDropZone: FC<HeroDropZoneProps> = ({
  onFileSelected,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelected(file);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelected(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (!disabled && fileInputRef.current) {
          fileInputRef.current.click();
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e: KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          fileInputRef.current?.click();
        }
      }}
      className={`group relative w-full rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 p-5 sm:p-8 text-center ${
        isDragOver
          ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_30px_rgba(56,189,248,0.2)]'
          : 'border-slate-800/90 hover:border-slate-700 bg-slate-900/70 hover:bg-slate-900/90 shadow-2xl shadow-black/40'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Stripe-style subtle top gradient glow */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Center Icon */}
      <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-cyan-400 group-hover:text-white group-hover:bg-cyan-600 transition-all duration-200 mb-3.5 shadow-md">
        {isDragOver ? (
          <FileCheck className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-200 animate-bounce" />
        ) : (
          <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
        )}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
          {isDragOver ? 'Release to upload' : 'Choose a file or drop here'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto font-light leading-relaxed">
          Stream files directly to any peer without server storage limits.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-200 group-hover:border-cyan-500/40 group-hover:text-white transition-all shadow-sm">
          <span>Select File</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
        </span>
      </div>

      {/* Trust Badges */}
      <div className="mt-5 pt-4 border-t border-slate-800/70 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>No Size Cap</span>
        </div>
        <span className="text-slate-700">•</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Encrypted Direct P2P</span>
        </div>
      </div>
    </div>
  );
};
