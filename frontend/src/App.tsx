import { useState } from 'react';
import { Home } from './pages/Home';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { About } from './pages/About';
import { HowItWorks } from './pages/HowItWorks';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';
import { ShieldCheck, ArrowLeftRight, HelpCircle, User, Mail } from 'lucide-react';

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

export type AppView = 'home' | 'send' | 'receive' | 'how-it-works' | 'about' | 'privacy' | 'terms';

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
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
                ShareWithOTP2.O
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-sky-400 block leading-none">
                P2P Secure File Transfer
              </span>
            </div>
          </button>

          {/* Nav Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setCurrentView('how-it-works')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentView === 'how-it-works'
                  ? 'bg-slate-900 text-sky-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">How It Works</span>
            </button>

            <button
              onClick={() => setCurrentView('about')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentView === 'about'
                  ? 'bg-slate-900 text-sky-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">About Developer</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/70 text-slate-300 text-xs font-medium ml-1">
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
        {currentView === 'how-it-works' && (
          <HowItWorks onBack={() => setCurrentView('home')} onNavigate={setCurrentView} />
        )}
        {currentView === 'about' && (
          <About onBack={() => setCurrentView('home')} onNavigate={setCurrentView} />
        )}
        {currentView === 'privacy' && <PrivacyPolicy onBack={() => setCurrentView('home')} />}
        {currentView === 'terms' && <TermsConditions onBack={() => setCurrentView('home')} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950/60 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">ShareWithOTP2.O</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Direct Browser-to-Browser P2P Transfer</span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
              <button
                onClick={() => setCurrentView('how-it-works')}
                className="text-slate-400 hover:text-sky-400 transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => setCurrentView('about')}
                className="text-slate-400 hover:text-sky-400 transition-colors"
              >
                About Developer
              </button>
              <button
                onClick={() => setCurrentView('privacy')}
                className="text-slate-400 hover:text-sky-400 transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setCurrentView('terms')}
                className="text-slate-400 hover:text-sky-400 transition-colors"
              >
                Terms & Conditions
              </button>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
            <p>
              Designed & Developed by{' '}
              <button
                onClick={() => setCurrentView('about')}
                className="text-slate-300 font-medium hover:text-sky-400 transition-colors"
              >
                Dinesh Chitturu
              </button>{' '}
              • Ephemeral WebRTC & One-Time Password Engine
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/dineshchitturu"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-300 flex items-center gap-1 transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/dinesh-chitturu-b4152b38b/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-300 flex items-center gap-1 transition-colors"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:dineshchitturu2005@gmail.com"
                className="hover:text-slate-300 flex items-center gap-1 transition-colors"
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

