import { useState } from 'react';
import { Home } from './pages/Home';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { ShieldCheck, ArrowLeftRight } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'send' | 'receive'>('home');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-600/30">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold text-base tracking-tight text-white block leading-tight">
                ShareWithOTP
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-sky-400 block leading-none">
                Temporary P2P Transfer
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/70 text-slate-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Server Storage</span>
            </div>

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
          <p className="font-mono text-[11px] text-slate-600">
            Room IDs and OTPs are strictly ephemeral and destroyed upon completion.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
