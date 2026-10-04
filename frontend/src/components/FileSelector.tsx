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
      <div className="w-full max-w-lg mx-auto simple-card p-6 relative overflow-hidden bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600 shadow-xs">
              <HardDrive className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Ready to stream
                </span>
              </div>
              <h4 className="text-base font-bold text-gray-900 truncate mt-1">{selectedFile.name}</h4>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {formatBytes(selectedFile.size)} • {selectedFile.type || 'Binary File'}
              </p>
            </div>
          </div>

          {!disabled && (
            <button
              onClick={onClearFile}
              className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
              title="Change file"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
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
        className={`group relative upload-dropzone p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragging ? 'upload-dropzone-active' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-50 border border-blue-100 group-hover:border-blue-300 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-all duration-200 shadow-xs">
          {isDragging ? (
            <CloudUpload className="w-7 h-7 animate-bounce text-blue-600" />
          ) : (
            <FileUp className="w-7 h-7" />
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 tracking-tight group-hover:text-blue-600 transition-colors">
          {isDragging ? 'Release to select file' : 'Drop your file here'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-5 max-w-sm mx-auto leading-relaxed">
          Drag & drop or browse from device. Supports 100 MB, 500 MB, 1 GB+ with direct streaming.
        </p>

        <span className="btn-sm btn-secondary group-hover:border-gray-300">
          <span>Browse local files</span>
          <span className="ml-1 text-gray-400 group-hover:translate-x-0.5 transition-transform">-&gt;</span>
        </span>
      </div>
    </div>
  );
};
