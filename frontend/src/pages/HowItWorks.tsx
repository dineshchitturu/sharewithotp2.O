import React from 'react';
import { ArrowLeft, KeyRound, Radio, Network, Download, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

interface HowItWorksProps {
  onBack: () => void;
  onNavigate: (view: 'send' | 'receive') => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onBack, onNavigate }) => {
  const steps = [
    {
      step: '01',
      icon: <KeyRound className="w-6 h-6 text-cyan-400" />,
      title: 'Sender Generates Ephemeral 6-Digit OTP',
      desc: 'The sender selects their file (> 100 MB supported) and clicks Generate Code. The backend generates a random 6-digit one-time password (OTP) stored only as a salted SHA-256 hash in volatile memory.',
    },
    {
      step: '02',
      icon: <Radio className="w-6 h-6 text-indigo-400" />,
      title: 'Receiver Authenticates with OTP',
      desc: 'The receiver visits ShareWithOTP2.O on their browser, enters the 6-digit OTP (or opens the direct link). The backend validates the salted hash with brute-force rate-limiting and issues a single-use session token.',
    },
    {
      step: '03',
      icon: <Network className="w-6 h-6 text-purple-400" />,
      title: 'WebRTC P2P Handshake',
      desc: 'Both browsers connect to a lightweight signaling relay over WebSockets to exchange session description protocol (SDP) offers and ICE candidates. No file bytes pass through this channel.',
    },
    {
      step: '04',
      icon: <Download className="w-6 h-6 text-emerald-400" />,
      title: 'Direct Browser-to-Browser Streaming',
      desc: 'An encrypted RTCDataChannel connects directly between the two browsers. The file streams in 64 KB binary chunks with backpressure handling and parallel WebAssembly SHA-256 hashing.',
    },
    {
      step: '05',
      icon: <CheckCircle2 className="w-6 h-6 text-teal-400" />,
      title: 'Integrity Verification & Destruction',
      desc: 'The receiver verifies the cryptographic hash against the sender’s trailer digest, builds the local file for download, and triggers immediate destruction of the temporary room and credentials.',
    },
  ];

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

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="badge-luminous-pill">
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>How It Works</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          How P2P File Sharing Works
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Learn how ShareWithOTP2.O streams large files directly between devices without uploading or storing a single byte on a server.
        </p>
      </div>

      {/* Steps Walkthrough */}
      <div className="space-y-4 mb-14">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6 glass-panel-interactive rounded-2xl"
          >
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-lg font-mono font-black text-cyan-400/70 sm:w-8">
                {item.step}
              </span>
              <div className="w-12 h-12 rounded-xl bg-[#071329] border border-white/15 flex items-center justify-center shadow-inner">
                {item.icon}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison: Traditional vs ShareWithOTP2.O */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 mb-12 relative overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          Traditional Cloud Sharing vs ShareWithOTP2.O
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional */}
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3 text-rose-400 font-semibold text-sm">
              <XCircle className="w-4 h-4" />
              <span>Traditional Cloud Uploads</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>• File is uploaded to and saved on a central third-party server</li>
              <li>• Double bandwidth cost: Upload to cloud, then download from cloud</li>
              <li>• Files persist in databases or buckets until manually deleted</li>
              <li>• Vulnerable to server data breaches and unauthorized access</li>
              <li>• Requires account creation or email verification</li>
            </ul>
          </div>

          {/* ShareWithOTP2.O */}
          <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.1)]">
            <div className="flex items-center gap-2 mb-3 text-cyan-300 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>ShareWithOTP2.O Direct P2P</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              <li>• Direct browser-to-browser WebRTC DataChannel streaming</li>
              <li>• Single direct transit: Fast local or global transfer speed</li>
              <li>• Zero server file storage: Files never touch backend disk</li>
              <li>• Ephemeral 6-digit OTP destroyed immediately after transfer</li>
              <li>• Completely anonymous: No signup, cookies, or account required</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => onNavigate('send')}
          className="w-full sm:w-auto btn-luminous-pill px-8 py-3.5 text-sm gap-2"
        >
          Send a File Now →
        </button>
        <button
          onClick={() => onNavigate('receive')}
          className="w-full sm:w-auto btn-glass-pill px-8 py-3.5 text-sm gap-2 border-emerald-400/40 text-emerald-300 hover:bg-emerald-950/30"
        >
          Receive a File →
        </button>
      </div>
    </div>
  );
};
