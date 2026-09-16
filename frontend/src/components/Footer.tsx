import React from 'react';
import { Mail, ArrowLeftRight } from 'lucide-react';

interface FooterProps {
  onOpenModal: (type: 'about' | 'privacy' | 'terms') => void;
  onScrollTo: (elementId: string) => void;
}

const GithubIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const LinkedinIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export const Footer: React.FC<FooterProps> = ({ onOpenModal, onScrollTo }) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-10 text-xs text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-600/20">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white tracking-tight text-sm">
              ShareWithOTP2.O
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-xs">Direct WebRTC P2P</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <button
              onClick={() => onScrollTo('how-it-works')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => onScrollTo('security')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Security
            </button>
            <button
              onClick={() => onOpenModal('about')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              About Developer
            </button>
            <button
              onClick={() => onOpenModal('privacy')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenModal('terms')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            Designed & Developed by{' '}
            <button
              onClick={() => onOpenModal('about')}
              className="text-slate-200 font-semibold hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Dinesh Chitturu
            </button>{' '}
            • Zero Server Retention Engine
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/dineshchitturu"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/dinesh-chitturu-b4152b38b/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
            <a
              href="mailto:dineshchitturu2005@gmail.com"
              className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
