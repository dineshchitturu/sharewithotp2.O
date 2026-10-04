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
      icon: <KeyRound className="w-5 h-5 text-blue-600" />,
      title: 'Sender Generates Ephemeral 6-Digit OTP',
      desc: 'The sender selects their file (> 100 MB supported) and clicks Generate Code. The backend generates a random 6-digit one-time password stored only as a salted SHA-256 hash in volatile RAM.',
    },
    {
      step: '02',
      icon: <Radio className="w-5 h-5 text-indigo-600" />,
      title: 'Receiver Authenticates with OTP',
      desc: 'The receiver visits ShareWithOTP2.O on their browser, enters the 6-digit OTP (or opens the direct link). The backend validates the salted hash with brute-force rate-limiting and issues a single-use session token.',
    },
    {
      step: '03',
      icon: <Network className="w-5 h-5 text-cyan-600" />,
      title: 'WebRTC P2P Handshake',
      desc: 'Both browsers connect to a lightweight signaling relay over WebSockets to exchange session description protocol (SDP) offers and ICE candidates. No file bytes pass through this channel.',
    },
    {
      step: '04',
      icon: <Download className="w-5 h-5 text-emerald-600" />,
      title: 'Direct Browser-to-Browser Streaming',
      desc: 'An encrypted RTCDataChannel connects directly between the two browsers. The file streams in 1 MB chunks and 64 KB SCTP slices with backpressure handling and parallel WebAssembly SHA-256 hashing.',
    },
    {
      step: '05',
      icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
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
          className="btn-sm btn-secondary gap-1.5 cursor-pointer text-gray-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-mono text-gray-500">
          ShareWithOTP2.O • Architecture
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Network className="w-3.5 h-3.5 text-blue-600" />
            <span>Workflow & Protocol</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
          How P2P File Sharing Works
        </h1>
        <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
          Learn how ShareWithOTP2.O streams large files directly between devices without uploading or storing a single byte on a server.
        </p>
      </div>

      {/* Steps Walkthrough */}
      <div className="space-y-4 mb-14">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6 simple-card bg-white"
          >
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-lg font-mono font-bold text-blue-600 sm:w-8">
                {item.step}
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
                {item.icon}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison: Traditional vs ShareWithOTP2.O */}
      <div className="simple-card rounded-2xl p-6 sm:p-8 mb-12 bg-white">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Traditional Cloud Sharing vs ShareWithOTP2.O
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3 text-rose-700 font-semibold text-sm">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Traditional Cloud Uploads</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
              <li>• File is uploaded to and saved on a central third-party server</li>
              <li>• Double bandwidth cost: Upload to cloud, then download from cloud</li>
              <li>• Files persist in databases or buckets until manually deleted</li>
              <li>• Vulnerable to server data breaches and unauthorized access</li>
              <li>• Requires account creation or email verification</li>
            </ul>
          </div>

          {/* ShareWithOTP2.O */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-blue-700 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ShareWithOTP2.O Direct P2P</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
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
          className="w-full sm:w-auto btn btn-primary px-8 py-3 text-sm font-semibold shadow-md cursor-pointer"
        >
          <span>Send a File Now</span>
          <span className="ml-1 text-blue-200">-&gt;</span>
        </button>
        <button
          onClick={() => onNavigate('receive')}
          className="w-full sm:w-auto btn btn-secondary px-8 py-3 text-sm font-semibold cursor-pointer"
        >
          <span>Receive a File</span>
          <span className="ml-1 text-gray-400">-&gt;</span>
        </button>
      </div>
    </div>
  );
};
