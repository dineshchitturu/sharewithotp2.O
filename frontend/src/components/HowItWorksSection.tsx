import React from 'react';
import { KeyRound, Radio, Network, Download, ShieldCheck, XCircle, Sparkles } from 'lucide-react';

interface HowItWorksSectionProps {
  onSelectMode: (mode: 'send' | 'receive') => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onSelectMode }) => {
  const steps = [
    {
      number: '01',
      icon: <KeyRound className="w-5 h-5 text-cyan-400" />,
      title: 'Generate Ephemeral 6-Digit OTP',
      desc: 'Select your file of any size. The engine generates a random 6-digit one-time password stored only as a salted cryptographic hash in volatile memory.',
    },
    {
      number: '02',
      icon: <Radio className="w-5 h-5 text-sky-400" />,
      title: 'Receiver Authenticates',
      desc: 'The receiver visits the link or enters the 6-digit code. The backend validates the code with brute-force rate-limiting and brokers the temporary signaling connection.',
    },
    {
      number: '03',
      icon: <Network className="w-5 h-5 text-indigo-400" />,
      title: 'Encrypted WebRTC P2P Stream',
      desc: 'Browsers establish a direct DTLS/SCTP DataChannel. Data flows in 64 KB binary chunks directly peer-to-peer without ever touching server disk or proxy.',
    },
    {
      number: '04',
      icon: <Download className="w-5 h-5 text-emerald-400" />,
      title: 'SHA-256 Verified & Self-Destruct',
      desc: 'Receiver computes streaming SHA-256 checksum in real-time. Once complete, the session self-destructs and the file is saved locally to the receiver’s device.',
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-16 sm:py-24 border-t border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architecture & Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Browser-to-Browser Transfer Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 font-light leading-relaxed">
            Zero cloud uploads. Zero intermediate database storage. Your files move directly through an encrypted peer tunnel between sender and receiver.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 backdrop-blur-sm group hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-mono font-black text-slate-700 group-hover:text-cyan-400/80 transition-colors">
                  {step.number}
                </span>
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {step.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Comparison: Traditional Cloud vs ShareWithOTP2.O */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Traditional Cloud Uploads vs ShareWithOTP2.O
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Why peer-to-peer streaming is faster, safer, and completely private
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-rose-950/40 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Traditional Cloud Platforms</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed font-light">
                <li>• Files are uploaded to and retained on central servers</li>
                <li>• Double transit latency: Upload to cloud first, then download from cloud</li>
                <li>• Data persists on third-party disks indefinitely until manual deletion</li>
                <li>• Vulnerable to server breaches, data scraping, and corporate snooping</li>
                <li>• Enforces account registration, email verification, and upload caps</li>
              </ul>
            </div>

            {/* ShareWithOTP2.O */}
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-emerald-950/50 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>ShareWithOTP2.O Direct P2P</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed font-light">
                <li>• True WebRTC DataChannel browser-to-browser streaming</li>
                <li>• Single direct connection: Maximum available bandwidth on local or WAN</li>
                <li>• 100% In-RAM stream: Zero bytes stored on backend or proxy</li>
                <li>• Ephemeral single-use 6-digit OTP destroyed immediately after transfer</li>
                <li>• Completely anonymous: No signup, tracking cookies, or subscriptions</li>
              </ul>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                onSelectMode('send');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all text-xs sm:text-sm shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              Start Sending a File →
            </button>
            <button
              onClick={() => {
                onSelectMode('receive');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl font-semibold text-emerald-400 bg-slate-950 hover:bg-slate-800 border border-emerald-500/30 transition-all text-xs sm:text-sm cursor-pointer"
            >
              Receive with Code →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
