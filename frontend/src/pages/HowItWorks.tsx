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
      icon: <KeyRound className="w-6 h-6 text-sky-400" />,
      title: 'Sender Chooses Room ID & Gets OTP',
      desc: 'The sender selects their file (> 100 MB supported) and defines a temporary Room ID. The backend generates a random 6-digit one-time password (OTP) stored only as a salted SHA-256 hash in volatile memory.',
    },
    {
      step: '02',
      icon: <Radio className="w-6 h-6 text-indigo-400" />,
      title: 'Receiver Authenticates',
      desc: 'The receiver visits ShareWithOTP2.O on their browser, enters the Room ID and 6-digit OTP. The backend validates the salted hash with brute-force rate-limiting and issues a single-use session token.',
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
          ShareWithOTP2.O • Architecture
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Network className="w-3.5 h-3.5" />
          <span>How It Works</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          How P2P File Sharing Works
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Learn how ShareWithOTP2.O streams large files directly between devices without uploading or storing a single byte on a server.
        </p>
      </div>

      {/* Steps Walkthrough */}
      <div className="space-y-4 mb-14">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xl font-mono font-black text-slate-600 sm:w-8">
                {item.step}
              </span>
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                {item.icon}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison: Traditional vs ShareWithOTP2.O */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 mb-12">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          Traditional Cloud Sharing vs ShareWithOTP2.O
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional */}
          <div className="bg-slate-950/70 border border-rose-950/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-rose-400 font-semibold text-sm">
              <XCircle className="w-4 h-4" />
              <span>Traditional Cloud Uploads</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• File is uploaded to and saved on a central third-party server</li>
              <li>• Double bandwidth cost: Upload to cloud, then download from cloud</li>
              <li>• Files persist in databases or buckets until manually deleted</li>
              <li>• Vulnerable to server data breaches and unauthorized access</li>
              <li>• Requires account creation or email verification</li>
            </ul>
          </div>

          {/* ShareWithOTP2.O */}
          <div className="bg-slate-950/70 border border-emerald-950/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-emerald-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>ShareWithOTP2.O Direct P2P</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
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
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-medium text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20 text-sm"
        >
          Send a File Now
        </button>
        <button
          onClick={() => onNavigate('receive')}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-medium text-emerald-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors text-sm"
        >
          Receive a File
        </button>
      </div>
    </div>
  );
};
