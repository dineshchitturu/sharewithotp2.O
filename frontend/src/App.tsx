import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Send } from './pages/Send';
import { Receive } from './pages/Receive';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';
import { Mail } from 'lucide-react';

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
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

  // Handle in-page smooth scrolling to sections without modifying URL or adding hashes
  const scrollToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      window.setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Ensure the URL remains clean as 'http://localhost:5173/' with no hash fragments (#home, #about, etc.)
  useEffect(() => {
    const stripHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };
    stripHash();
    window.addEventListener('hashchange', stripHash);
    return () => window.removeEventListener('hashchange', stripHash);
  }, []);

  const handleStartSend = () => {
    setCurrentView('send');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartReceive = () => {
    setCurrentView('receive');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      
      {/* Background Page Illustrations matching Cruip Simple template */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform"
        aria-hidden="true"
      >
        <img
          className="max-w-none"
          src="/images/stripes.svg"
          width={768}
          alt="Stripes decoration"
        />
      </div>

      <div
        className="pointer-events-none absolute -top-32 left-1/2 ml-[580px] -translate-x-1/2 -z-10"
        aria-hidden="true"
      >
        <div className="h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500 opacity-40 blur-[160px]" />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-[420px] ml-[380px] -translate-x-1/2 -z-10"
        aria-hidden="true"
      >
        <div className="h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500 to-gray-900 opacity-25 blur-[160px]" />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-[640px] -ml-[300px] -translate-x-1/2 -z-10"
        aria-hidden="true"
      >
        <div className="h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500 to-gray-900 opacity-20 blur-[160px]" />
      </div>

      {/* ======================================================== */}
      {/* MAIN VIEW AREA                                           */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col justify-center relative z-10 pt-6 sm:pt-10">
        {currentView === 'home' && (
          <Home
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        {currentView === 'send' && <Send onBack={handleBackToHome} />}
        {currentView === 'receive' && <Receive onBack={handleBackToHome} />}
        {currentView === 'privacy' && <PrivacyPolicy onBack={handleBackToHome} />}
        {currentView === 'terms' && <TermsConditions onBack={handleBackToHome} />}
      </main>

      {/* ======================================================== */}
      {/* FOOTER (Matching Cruip Simple footer.tsx)                */}
      {/* ======================================================== */}
      <footer className="mt-20 border-t [border-image:linear-gradient(to_right,transparent,var(--color-gray-200),transparent)1] bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 py-10 sm:grid-cols-12 md:py-14">
            
            {/* 1st block: Brand & Creator */}
            <div className="space-y-3 sm:col-span-12 lg:col-span-5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 tracking-tight text-base">ShareWithOTP2.O</span>
              </div>
              <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
                Privacy-first, zero-knowledge browser-to-browser P2P large file sharing engine. Powered by WebRTC and ephemeral one-time passwords.
              </p>
              <div className="text-xs text-gray-500">
                Designed & Developed by{' '}
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-[13px] font-bold text-gray-900 hover:text-blue-600 cursor-pointer underline decoration-gray-400 underline-offset-2 transition-colors"
                >
                  Dinesh Chitturu
                </button>
              </div>
            </div>

            {/* 2nd block: Product links */}
            <div className="space-y-2 sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900">Application</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={handleStartSend} className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                    Send File
                  </button>
                </li>
                <li>
                  <button onClick={handleStartReceive} className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                    Receive File
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('about')} className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                    Architecture
                  </button>
                </li>
              </ul>
            </div>

            {/* 3rd block: Legal & Privacy */}
            <div className="space-y-2 sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => {
                      setCurrentView('privacy');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setCurrentView('terms');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Terms & Conditions
                  </button>
                </li>
              </ul>
            </div>

            {/* 4th block: Connect / Social */}
            <div className="space-y-2 sm:col-span-6 md:col-span-3 lg:col-span-3">
              <h3 className="text-sm font-semibold text-gray-900">Connect</h3>
              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href="https://github.com/dineshchitturu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 flex items-center justify-center transition-colors"
                  aria-label="GitHub"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/dinesh-chitturu-b4152b38b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
                <a
                  href="mailto:dineshchitturu2005@gmail.com"
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 flex items-center justify-center transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-gray-500 pt-2 font-mono">
                Direct WebRTC • SHA-256 Verified
              </p>
            </div>

          </div>

          <div className="border-t border-gray-100 py-6 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>&copy; {new Date().getFullYear()} ShareWithOTP2.O. All rights reserved. Zero server file storage.</span>
            <span className="font-mono text-gray-400">v2.0.0-p2p</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
