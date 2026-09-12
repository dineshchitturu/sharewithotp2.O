import { useState } from 'react';
import { Home } from './pages/Home';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { ServerSettingsModal } from './components/ServerSettingsModal';
import { isBackendConfigured } from './services/api';
import { ShieldCheck, ArrowLeftRight, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'send' | 'receive'>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-600/30">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">
                ShareWithOTP
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-sky-400 block leading-none">
                Temporary P2P Transfer
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/70 text-slate-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Server Storage</span>
            </div>

            {/* Server Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors border border-slate-800/80"
              title="Backend Server Settings"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Server</span>
            </button>

            {currentView !== 'home' && (
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Home
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Warning banner when deployed on remote host without backend configured */}
      {!isBackendConfigured() && (
        <div className="bg-amber-950/80 border-b border-amber-800/90 px-4 py-2.5 text-center text-xs text-amber-200 flex items-center justify-center gap-2 flex-wrap">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Backend not connected: Running on deployed domain ({typeof window !== 'undefined' ? window.location.hostname : 'remote'}).
          </span>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="font-bold underline text-white hover:text-amber-100 ml-1 cursor-pointer"
          >
            Connect FastAPI Backend URL →
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center">
        {currentView === 'home' && <Home onNavigate={setCurrentView} />}
        {currentView === 'send' && <Send onBack={() => setCurrentView('home')} />}
        {currentView === 'receive' && <Receive onBack={() => setCurrentView('home')} />}
      </main>

      {/* Privacy Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Phase 1 • Secure WebRTC DataChannel Direct Transfer • No File Storage
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-500 hover:text-slate-300 underline font-mono text-[11px] cursor-pointer"
            >
              Configure Backend URL
            </button>
            <span className="text-slate-700">•</span>
            <p className="font-mono text-[11px] text-slate-600">
              Ephemeral Sessions
            </p>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <ServerSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
