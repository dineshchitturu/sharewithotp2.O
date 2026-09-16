import React from 'react';
import { Lock, ShieldCheck, Cpu, Trash2, Key, EyeOff } from 'lucide-react';

export const SecurityArchitecture: React.FC = () => {
  const securityFeatures = [
    {
      icon: <Lock className="w-5 h-5 text-cyan-400" />,
      title: 'End-to-End DTLS / SCTP Encryption',
      desc: 'All WebRTC DataChannel traffic is strictly encrypted peer-to-peer using Datagram Transport Layer Security (DTLS). Eavesdroppers cannot inspect or tamper with in-flight data.',
    },
    {
      icon: <EyeOff className="w-5 h-5 text-sky-400" />,
      title: 'Zero-Knowledge Server Design',
      desc: 'The backend operates purely as an ephemeral signaling broker. File chunks never touch the server disk, memory buffer, or reverse proxy. The server never sees your content.',
    },
    {
      icon: <Key className="w-5 h-5 text-amber-400" />,
      title: 'Salted Cryptographic OTPs',
      desc: 'One-time codes are stored on the broker as salted SHA-256 hashes. Even if volatile memory were intercepted, raw OTP codes cannot be reversed or recovered.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: 'Brute-Force Attack Mitigation',
      desc: 'Verification is strictly limited to 5 failed attempts per room. If exceeded, the room immediately transitions to LOCKED state and permanently destroys credentials.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      title: 'Streaming SHA-256 Integrity Verification',
      desc: 'Files are hashed incrementally as chunks arrive using high-speed WebAssembly / SubtleCrypto. Both ends compare checksums before the file is rendered accessible.',
    },
    {
      icon: <Trash2 className="w-5 h-5 text-rose-400" />,
      title: 'Instant Session Self-Destruction',
      desc: 'Upon transfer completion, receiver disconnect, or 15-minute expiration, all session tokens, ICE candidates, and temporary room state are immediately wiped from memory.',
    },
  ];

  return (
    <section id="security" className="w-full py-16 sm:py-24 border-t border-slate-800/80 bg-slate-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Trust Security Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Absolute Confidentiality
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 font-light leading-relaxed">
            By eliminating centralized storage completely, ShareWithOTP2.O removes the attack surface of traditional file sharing services.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
