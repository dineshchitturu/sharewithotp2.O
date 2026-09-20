import { type FC } from 'react';
import { ArrowLeftRight, HelpCircle, User, Shield } from 'lucide-react';

interface NavbarProps {
  mode: 'send' | 'receive';
  onSelectMode: (mode: 'send' | 'receive') => void;
  onOpenModal: (type: 'about' | 'privacy' | 'terms') => void;
  onScrollTo: (elementId: string) => void;
}

export const Navbar: FC<NavbarProps> = ({
  mode,
  onSelectMode,
  onOpenModal,
  onScrollTo,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/90 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 sm:gap-2.5 group text-left focus:outline-none shrink-0 cursor-pointer"
        >
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                ShareWithOTP2.O
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 block font-mono leading-none">
              Direct P2P
            </span>
          </div>
        </button>

        {/* Center Mode Switcher Tabs - Stripe Segmented Control */}
        <div className="flex items-center bg-slate-900/90 p-0.5 sm:p-1 rounded-full border border-slate-800/90 shadow-inner">
          <button
            onClick={() => onSelectMode('send')}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              mode === 'send'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Send
          </button>
          <button
            onClick={() => onSelectMode('receive')}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              mode === 'receive'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Receive
          </button>
        </div>

        {/* Right Navigation & Quick Links */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => onScrollTo('how-it-works')}
            className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white px-2 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How it Works</span>
          </button>

          <button
            onClick={() => onScrollTo('security')}
            className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white px-2 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Security</span>
          </button>

          <button
            onClick={() => onOpenModal('about')}
            className="flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline sm:inline">About</span>
          </button>
        </div>
      </div>
    </header>
  );
};
