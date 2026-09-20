import type { FC } from 'react';
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
    return <ImageIcon className="w-6 h-6 text-sky-400" />;
  }
  if (mimeType.startsWith('video/') || ['mp4', 'mkv', 'mov', 'avi', 'webm'].includes(ext)) {
    return <FileVideo className="w-6 h-6 text-purple-400" />;
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) {
    return <FileAudio className="w-6 h-6 text-emerald-400" />;
  }
  if (
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) ||
    mimeType.includes('zip') ||
    mimeType.includes('compressed')
  ) {
    return <FileArchive className="w-6 h-6 text-amber-400" />;
  }
  if (['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'go', 'rs', 'html', 'css'].includes(ext)) {
    return <FileCode className="w-6 h-6 text-cyan-400" />;
  }
  return <FileText className="w-6 h-6 text-blue-400" />;
}

export const FilePreviewCard: FC<FilePreviewCardProps> = ({
  file,
  onClear,
  onConfirm,
  isLoading,
}) => {
  return (
    <div className="w-full rounded-2xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 shadow-2xl shadow-black/40 transition-all">
      {/* Top Header with File info and Cancel 'X' */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-md">
            {getFileIcon(file.type, file.name)}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-white truncate" title={file.name}>
              {file.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
              <span>{formatBytes(file.size)}</span>
              <span>•</span>
              <span className="uppercase">{file.name.split('.').pop() || 'FILE'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClear}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-40 cursor-pointer"
          title="Remove file"
          aria-label="Remove selected file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Security Note */}
      <div className="py-3.5 flex items-center gap-2 text-xs text-slate-400 font-mono text-[11px]">
        <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Direct encrypted peer stream • Ephemeral access code</span>
      </div>

      {/* Action Button */}
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-400/20 transition-all text-sm cursor-pointer"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Generate Code & Start Transfer</span>
          </>
        )}
      </button>
    </div>
  );
};
