import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 p-4 my-4 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl shadow-xs animate-fadeIn">
      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
      <div className="flex-1 leading-relaxed text-xs sm:text-sm font-medium">{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-700 transition-colors p-1 rounded-lg hover:bg-rose-100 cursor-pointer"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
