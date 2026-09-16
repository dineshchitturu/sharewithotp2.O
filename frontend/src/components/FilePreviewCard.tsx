import React from 'react';
import {
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  Image as ImageIcon,
  X,
  Sparkles,
  Shield,
} from 'lucide-react';
import { formatBytes } from '../utils/formatBytes';

interface FilePreviewCardProps {
  file: File;
  onClear: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

function getFileIcon(mimeType: string, fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext)) {
    return <ImageIcon className="w-8 h-8 text-sky-400" />;
  }
  if (mimeType.startsWith('video/') || ['mp4', 'mkv', 'mov', 'avi', 'webm'].includes(ext)) {
    return <FileVideo className="w-8 h-8 text-purple-400" />;
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) {
    return <FileAudio className="w-8 h-8 text-emerald-400" />;
  }
  if (
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) ||
    mimeType.includes('zip') ||
    mimeType.includes('compressed')
  ) {
    return <FileArchive className="w-8 h-8 text-amber-400" />;
  }
  if (['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'go', 'rs', 'html', 'css'].includes(ext)) {
    return <FileCode className="w-8 h-8 text-cyan-400" />;
  }
  return <FileText className="w-8 h-8 text-blue-400" />;
}

export const FilePreviewCard: React.FC<FilePreviewCardProps> = ({
  file,
  onClear,
  onConfirm,
  isLoading,
}) => {
  return (
    <div className="w-full rounded-2xl border border-cyan-500/30 bg-slate-900/90 backdrop-blur-xl p-6 shadow-2xl shadow-cyan-950/40 transition-all duration-300">
      {/* Top Header with File info and Cancel 'X' */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-md">
            {getFileIcon(file.type, file.name)}
          </div>
          <div className="min-w-0">
            <h4 className="text-base sm:text-lg font-bold text-white truncate" title={file.name}>
              {file.name}
            </h4>
            <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono mt-0.5">
              <span>{formatBytes(file.size)}</span>
              <span>•</span>
              <span className="uppercase">{file.name.split('.').pop() || 'FILE'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClear}
          disabled={isLoading}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-40"
          title="Remove file"
          aria-label="Remove selected file"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Security Note */}
      <div className="py-4 flex items-center gap-2.5 text-xs text-slate-400 font-mono">
        <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>Direct encrypted peer stream • File leaves only when receiver enters OTP</span>
      </div>

      {/* Action Button */}
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-cyan-500/25 transition-all text-sm sm:text-base cursor-pointer"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-cyan-200" />
            <span>Create Secure Share & Generate OTP</span>
          </>
        )}
      </button>
    </div>
  );
};
