import React, { useRef, useState } from 'react';
import { FileUp, HardDrive, ShieldCheck, X } from 'lucide-react';
import { formatBytes } from '../utils/formatBytes';

interface FileSelectorProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  disabled?: boolean;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  onFileSelect,
  selectedFile,
  onClearFile,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (selectedFile) {
    return (
      <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-800/60 flex items-center justify-center shrink-0">
              <HardDrive className="w-6 h-6 text-sky-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{selectedFile.name}</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {formatBytes(selectedFile.size)} • {selectedFile.type || 'Binary File'}
              </p>
            </div>
          </div>

          {!disabled && (
            <button
              onClick={onClearFile}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title="Change file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Streamed in slices directly to peer. Zero server storage.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`group border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-sky-400 bg-sky-950/20 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/80'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-800/80 group-hover:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-sky-400 transition-colors">
          <FileUp className="w-7 h-7" />
        </div>

        <h3 className="text-base font-semibold text-white mb-1">Choose a file to share</h3>
        <p className="text-xs text-slate-400 mb-3">
          Drag and drop or browse files. Supports 100 MB, 500 MB, 1 GB+.
        </p>

        <span className="inline-flex items-center text-xs font-medium text-sky-400 group-hover:text-sky-300">
          Browse local file →
        </span>
      </div>
    </div>
  );
};
