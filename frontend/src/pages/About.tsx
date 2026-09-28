import React from 'react';
import { Shield, Cpu, Zap, ArrowLeft } from 'lucide-react';

interface AboutProps {
  onBack: () => void;
  onNavigate: (view: 'send' | 'receive' | 'how-it-works') => void;
}

export const About: React.FC<AboutProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-14">
      {/* Top Bar */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="btn-glass-pill text-xs px-3.5 py-1.5 gap-1.5 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-mono text-slate-400">
          ShareWithOTP2.O • Architecture
        </span>
      </div>

      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="badge-luminous-pill">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Core Architecture</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          About ShareWithOTP2.O
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          A zero-knowledge, browser-to-browser temporary file sharing engine built with modern WebRTC, FastAPI, and cryptographic OTP verification.
        </p>
      </div>

      {/* Architecture Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="glass-feature-card p-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3 shadow-md">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Direct P2P DataChannels</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Files stream chunk-by-chunk directly through browser-to-browser SCTP channels with DTLS encryption. The backend never touches the file data.
          </p>
        </div>

        <div className="glass-feature-card p-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3 shadow-md">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Ephemeral OTP Authentication</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            6-digit one-time passwords stored exclusively as cryptographically salted hashes. Sessions automatically expire in 15 minutes and destroy upon completion.
          </p>
        </div>

        <div className="glass-feature-card p-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3 shadow-md">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Streaming SHA-256 Checksum</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Both peers compute cryptographic SHA-256 digests in real-time via WebAssembly to verify byte-level integrity prior to receiver download.
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="glass-panel p-8 rounded-3xl text-center">
        <h3 className="text-base sm:text-lg font-bold text-white mb-2">Ready to try ShareWithOTP2.O?</h3>
        <p className="text-xs text-slate-300 mb-5">No account registration or software installation required.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('send')}
            className="btn-luminous-pill px-6 py-2.5 text-xs font-semibold"
          >
            Send Files →
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className="btn-glass-pill px-6 py-2.5 text-xs font-semibold text-slate-200"
          >
            How It Works →
          </button>
        </div>
      </div>
    </div>
  );
};
