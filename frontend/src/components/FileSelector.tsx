import React, { useRef, useState } from 'react';
import { FileUp, HardDrive, ShieldCheck, X, CloudUpload } from 'lucide-react';
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
      <div className="w-full max-w-lg mx-auto glass-panel rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle top edge glow */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-cyan-900/60 border border-cyan-400/30 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-950/40 text-cyan-300">
              <HardDrive className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Ready to stream
                </span>
              </div>
              <h4 className="text-base font-bold text-white truncate mt-1">{selectedFile.name}</h4>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {formatBytes(selectedFile.size)} • {selectedFile.type || 'Binary File'}
              </p>
            </div>
          </div>

          {!disabled && (
            <button
              onClick={onClearFile}
              className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 border border-transparent hover:border-white/10 transition-all shrink-0 cursor-pointer"
              title="Change file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center gap-2 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Encrypted WebRTC P2P stream • Zero server storage</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
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
        className={`group relative upload-dropzone p-8 md:p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragging ? 'upload-dropzone-active' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Soft top highlight */}
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#09172e] border border-cyan-500/30 group-hover:border-cyan-400/50 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:text-cyan-300 transition-all duration-200 shadow-xl shadow-cyan-950/60">
          {isDragging ? (
            <CloudUpload className="w-8 h-8 animate-bounce text-cyan-300" />
          ) : (
            <FileUp className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight group-hover:text-cyan-100 transition-colors">
          {isDragging ? 'Release to upload file' : 'Drop your files here'}
        </h3>
        <p className="text-xs text-slate-300 mb-5 max-w-sm mx-auto leading-relaxed">
          Drag and drop or browse files from your device. Supports 100 MB, 500 MB, 1 GB+ with direct streaming.
        </p>

        <span className="btn-glass-pill text-xs px-4 py-2 gap-1.5 text-cyan-300 border-cyan-400/30 group-hover:border-cyan-300/50 group-hover:bg-cyan-950/40">
          <span>Browse local files</span>
          <span>→</span>
        </span>
      </div>
    </div>
  );
};
