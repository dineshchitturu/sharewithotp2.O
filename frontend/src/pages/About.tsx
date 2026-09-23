import React from 'react';
import { Mail, Shield, Cpu, Zap, ArrowLeft, ExternalLink } from 'lucide-react';

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

interface AboutProps {
  onBack: () => void;
  onNavigate: (view: 'send' | 'receive' | 'how-it-works') => void;
}

export const About: React.FC<AboutProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-mono text-slate-500">
          ShareWithOTP2.O • Developer Profile
        </span>
      </div>

      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>Developer & Architect</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          About ShareWithOTP2.O
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          A zero-knowledge, browser-to-browser temporary file sharing engine built with modern WebRTC, FastAPI, and cryptographic OTP verification.
        </p>
      </div>

      {/* Developer Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm mb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar / Icon Badge */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-sky-600/30 shrink-0">
            DC
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Dinesh Chitturu</h2>
                {/* <p className="text-sm font-medium text-sky-400">Full-Stack & Systems Engineer</p> */}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/60 border border-slate-800 text-[11px] text-emerald-400 font-mono self-center sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {/* <span>Available for collaborations</span> */}
              </div>
            </div>

            {/* Contact & Social Links */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
              <a
                href="mailto:dineshchitturu2005@gmail.com"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-slate-200 text-xs font-medium transition-all"
              >
                <Mail className="w-4 h-4 text-sky-400" />
                <span>dineshchitturu2005@gmail.com</span>
              </a>

              <a
                href="https://www.linkedin.com/in/dinesh-chitturu-b4152b38b/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-slate-200 text-xs font-medium transition-all"
              >
                <LinkedinIcon className="w-4 h-4 text-blue-400" />
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              <a
                href="https://github.com/dineshchitturu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-slate-200 text-xs font-medium transition-all"
              >
                <GithubIcon className="w-4 h-4 text-slate-300" />
                <span>GitHub @dineshchitturu</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-sky-950/80 text-sky-400 flex items-center justify-center mb-3">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Direct P2P DataChannels</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Files stream chunk-by-chunk directly through browser-to-browser SCTP channels with DTLS encryption. The backend never touches the file data.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center mb-3">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Ephemeral OTP Authentication</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            6-digit one-time passwords stored exclusively as cryptographically salted hashes. Sessions automatically expire in 15 minutes and destroy upon completion.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-indigo-950/80 text-indigo-400 flex items-center justify-center mb-3">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Streaming SHA-256 Checksum</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Both peers compute cryptographic SHA-256 digests in real-time via WebAssembly to verify byte-level integrity prior to receiver download.
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="text-center p-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
        <h3 className="text-base font-bold text-white mb-2">Ready to try ShareWithOTP2.O?</h3>
        <p className="text-xs text-slate-400 mb-4">No account registration or software installation required.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('send')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-md shadow-sky-600/20"
          >
            Send Files
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            How It Works →
          </button>
        </div>
      </div>
    </div>
  );
};
