import React, { useState, useEffect } from 'react';
import { CheckCircle2, Globe, Server, X, AlertCircle, RefreshCw } from 'lucide-react';
import { getApiBase, setCustomApiBase, checkBackendHealth } from '../services/api';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({ isOpen, onClose }) => {
  const [backendUrl, setBackendUrl] = useState('');
  const [testStatus, setTestStatus] = useState<{ loading: boolean; ok?: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBackendUrl(getApiBase());
      setTestStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setCustomApiBase(backendUrl);
    onClose();
  };

  const handleReset = () => {
    setCustomApiBase('');
    setBackendUrl('');
    setTestStatus(null);
  };

  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    const result = await checkBackendHealth(backendUrl);
    setTestStatus({
      loading: false,
      ok: result.ok,
      message: result.message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Server className="w-5 h-5 text-sky-400" />
            <span>Backend Server Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          If your frontend and backend are deployed on separate services (e.g. Vercel frontend and Render backend), specify your backend API URL below.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Backend Server URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => {
                  setBackendUrl(e.target.value);
                  setTestStatus(null);
                }}
                placeholder="https://your-backend.onrender.com"
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Leave empty to use relative &apos;/api&apos; (for local dev or unified hosting).
            </span>
          </div>

          {testStatus && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testStatus.ok
                  ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                  : testStatus.loading
                  ? 'bg-slate-950 border-slate-800 text-slate-300'
                  : 'bg-rose-950/50 border-rose-800/60 text-rose-300'
              }`}
            >
              {testStatus.loading ? (
                <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5 text-sky-400" />
              ) : testStatus.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <span className="leading-snug break-all">
                {testStatus.loading ? 'Testing connection to backend...' : testStatus.message}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus?.loading}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="py-2 px-3 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="py-2 px-5 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
