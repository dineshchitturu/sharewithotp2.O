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
          className="btn-sm btn-secondary gap-1.5 cursor-pointer text-gray-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-mono text-gray-500">
          ShareWithOTP2.O • Architecture
        </span>
      </div>

      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Core Architecture</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
          About ShareWithOTP2.O
        </h1>
        <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
          A zero-knowledge, browser-to-browser temporary file sharing engine built with modern WebRTC, FastAPI, and cryptographic OTP verification.
        </p>
      </div>

      {/* Architecture Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="simple-card p-6 bg-white">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-2">Direct P2P DataChannels</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Files stream chunk-by-chunk directly through browser-to-browser SCTP channels with DTLS encryption. The backend never touches the file data.
          </p>
        </div>

        <div className="simple-card p-6 bg-white">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-2">Ephemeral OTP Auth</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            6-digit one-time passwords stored exclusively as cryptographically salted hashes. Sessions automatically expire in 15 minutes and destroy upon completion.
          </p>
        </div>

        <div className="simple-card p-6 bg-white">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-2">Streaming SHA-256</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Both peers compute cryptographic SHA-256 digests in real-time via WebAssembly to verify byte-level integrity prior to receiver download.
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="simple-card p-8 rounded-2xl text-center bg-gray-50/70 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to try ShareWithOTP2.O?</h3>
        <p className="text-sm text-gray-600 mb-6">No account registration or software installation required.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('send')}
            className="btn btn-primary py-2.5 px-6 text-xs font-semibold cursor-pointer shadow-sm"
          >
            <span>Send Files</span>
            <span className="ml-1 text-blue-200">-&gt;</span>
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className="btn btn-secondary py-2.5 px-6 text-xs font-semibold cursor-pointer"
          >
            <span>How It Works</span>
            <span className="ml-1 text-gray-400">-&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
