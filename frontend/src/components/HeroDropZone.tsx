import React, { useRef, useState } from 'react';
import { UploadCloud, FileCheck, Zap } from 'lucide-react';

interface HeroDropZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export const HeroDropZone: React.FC<HeroDropZoneProps> = ({
  onFileSelected,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelected(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          fileInputRef.current?.click();
        }
      }}
      className={`group relative w-full rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
        isDragOver
          ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_40px_rgba(56,189,248,0.25)] scale-[1.01]'
          : 'border-slate-800 hover:border-cyan-500/50 bg-slate-900/60 hover:bg-slate-900/80 shadow-2xl'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Decorative ambient background glow */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Center Icon */}
      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-cyan-400 group-hover:text-white group-hover:bg-gradient-to-tr group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:scale-110 shadow-xl group-hover:shadow-cyan-500/25 transition-all duration-300 mb-5">
        {isDragOver ? (
          <FileCheck className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 animate-bounce" />
        ) : (
          <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:-translate-y-1" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
          {isDragOver ? 'Release to select file' : 'Drop your file here, or click to browse'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto font-light leading-relaxed">
          Send large videos, archives, disk images, or documents directly to any device via encrypted P2P.
        </p>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/60">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>No File Size Limit</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/60">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>100% In-RAM P2P Stream</span>
        </div>
      </div>
    </div>
  );
};
