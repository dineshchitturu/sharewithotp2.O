import React from 'react';
import { ArrowLeftRight, ShieldCheck, HelpCircle, User, Shield } from 'lucide-react';

interface NavbarProps {
  mode: 'send' | 'receive';
  onSelectMode: (mode: 'send' | 'receive') => void;
  onOpenModal: (type: 'about' | 'privacy' | 'terms') => void;
  onScrollTo: (elementId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onSelectMode,
  onOpenModal,
  onScrollTo,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <ArrowLeftRight className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                ShareWithOTP2.O
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-semibold">
                P2P
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              Zero Server Storage
            </span>
          </div>
        </button>

        {/* Center Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-full border border-slate-800/80 shadow-inner">
          <button
            onClick={() => onSelectMode('send')}
            className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
              mode === 'send'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Send File
          </button>
          <button
            onClick={() => onSelectMode('receive')}
            className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
              mode === 'receive'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Receive File
          </button>
        </div>

        {/* Right Navigation & Quick Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onScrollTo('how-it-works')}
            className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/60 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How it Works</span>
          </button>

          <button
            onClick={() => onScrollTo('security')}
            className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/60 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Security</span>
          </button>

          <button
            onClick={() => onOpenModal('about')}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Developer</span>
          </button>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-950/40 text-emerald-400 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted</span>
          </div>
        </div>
      </div>
    </header>
  );
};
