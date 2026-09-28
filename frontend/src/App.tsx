import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';
import { Mail } from 'lucide-react';

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

  // Handle in-page smooth scrolling to sections without page navigation
  const scrollToSection = (sectionId: string) => {
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

  return (
    <div className="min-h-screen ocean-mesh-bg text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Ambient background light orbs for underwater depth */}
      <div className="fixed top-[-150px] left-[-100px] w-[550px] h-[550px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-pulse-glow -z-10" />
      <div className="fixed top-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-indigo-600/12 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[15%] left-[-120px] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-100px] right-[-80px] w-[550px] h-[550px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none -z-10" />

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
