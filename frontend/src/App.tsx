import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';
import {
  ArrowLeftRight,
  ArrowUpCircle,
  ArrowDownCircle,
  Menu,
  X,
  Mail,
} from 'lucide-react';

const GithubIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

export type AppView = 'home' | 'send' | 'receive' | 'privacy' | 'terms';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('otp') || params.get('code')) {
        return 'receive';
      }
    }
    return 'home';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle in-page smooth scrolling to sections without page navigation
  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);

    if (currentView !== 'home') {
      setCurrentView('home');
      window.setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (sectionId === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 80);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    try {
      window.history.pushState(null, '', `#${sectionId}`);
    } catch {}
  };

  // Handle URL hash on initial load
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && (hash === 'about' || hash === 'how-it-works' || hash === 'home')) {
      window.setTimeout(() => {
        scrollToSection(hash);
      }, 150);
    }
  }, []);

  const handleStartSend = () => {
    setIsMobileMenuOpen(false);
    setCurrentView('send');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartReceive = () => {
    setIsMobileMenuOpen(false);
    setCurrentView('receive');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen ocean-mesh-bg text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Ambient background light orbs for underwater depth */}
      <div className="fixed top-[-150px] left-[-100px] w-[550px] h-[550px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-pulse-glow -z-10" />
      <div className="fixed top-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-indigo-600/12 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[15%] left-[-120px] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-100px] right-[-80px] w-[550px] h-[550px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none -z-10" />

      {/* ======================================================== */}
      {/* FIXED / STICKY GLASSMORPHIC NAVIGATION BAR               */}
      {/* ======================================================== */}
      <header className="border-b border-white/10 bg-[#060e20]/75 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.35)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-2.5 hover:opacity-95 transition-all cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/25 border border-white/20 group-hover:scale-105 transition-transform duration-200">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-tight group-hover:text-cyan-200 transition-colors">
                ShareWithOTP
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400 block leading-none">
                P2P File Transfer
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md shadow-inner">
            <button
              onClick={() => scrollToSection('home')}
              className="text-xs font-semibold px-3.5 py-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              Home
            </button>

            <button
              onClick={() => scrollToSection('about')}
              className="text-xs font-semibold px-3.5 py-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              About
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-xs font-semibold px-3.5 py-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              How It Works
            </button>
          </nav>

          {/* Desktop Action Buttons: [Send File] [Receive File] */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={handleStartSend}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'send'
                  ? 'btn-luminous-pill ring-2 ring-cyan-400/50'
                  : 'btn-luminous-pill'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>Send File</span>
            </button>

            <button
              onClick={handleStartReceive}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'receive'
                  ? 'btn-glass-pill border-emerald-400/60 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'btn-glass-pill border-white/15 hover:border-emerald-400/40 text-emerald-300 hover:bg-emerald-950/20'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>Receive File</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={handleStartSend}
              className="flex sm:hidden items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold btn-luminous-pill text-white"
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#071126]/95 px-4 py-4 space-y-3 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => scrollToSection('home')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                How It Works
              </button>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={handleStartSend}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-semibold text-white btn-luminous-pill"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Send File</span>
              </button>
              <button
                onClick={handleStartReceive}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-semibold text-emerald-300 btn-glass-pill border-emerald-400/40 bg-emerald-950/30"
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>Receive File</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA                                        */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col justify-center relative z-10">
        {currentView === 'home' && (
          <Home
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        {currentView === 'send' && <Send onBack={() => scrollToSection('home')} />}
        {currentView === 'receive' && <Receive onBack={() => scrollToSection('home')} />}
        {currentView === 'privacy' && <PrivacyPolicy onBack={() => scrollToSection('home')} />}
        {currentView === 'terms' && <TermsConditions onBack={() => scrollToSection('home')} />}
      </main>

      {/* ======================================================== */}
      {/* FOOTER                                                   */}
      {/* ======================================================== */}
      <footer className="border-t border-white/10 py-6 bg-[#060e20]/60 backdrop-blur-xl text-xs text-slate-400 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>
              Designed & Developed by{' '}
              <button
                onClick={() => scrollToSection('about')}
                className="text-white font-semibold hover:text-cyan-400 transition-colors cursor-pointer underline decoration-cyan-500/40 underline-offset-2"
              >
                Dinesh Chitturu
              </button>{' '}
              • Ephemeral WebRTC & One-Time Password Engine
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/dineshchitturu"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/dinesh-chitturu-b4152b38b/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:dineshchitturu2005@gmail.com"
                className="hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
