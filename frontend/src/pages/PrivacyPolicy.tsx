import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, ServerOff, Clock } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 md:py-12">
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
          ShareWithOTP2.O • Privacy Policy
        </span>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy First Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Last Updated: September 13, 2026 • ShareWithOTP2.O
        </p>
      </div>

      <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3 text-white font-bold text-base">
            <ServerOff className="w-5 h-5 text-emerald-400" />
            <h2>1. Zero Server Storage Principle</h2>
          </div>
          <p className="text-slate-400 mb-3">
            ShareWithOTP2.O was architected with privacy as the core requirement. Unlike traditional file sharing or cloud drive services, <strong>your files are NEVER uploaded to, saved on, inspected by, or stored in any server, database, or disk.</strong>
          </p>
          <p className="text-slate-400">
            Files stream chunk-by-chunk in memory directly between the sender&apos;s browser and the receiver&apos;s browser using peer-to-peer (P2P) WebRTC DataChannels. The server acts strictly as a lightweight signaling coordinator.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3 text-white font-bold text-base">
            <Lock className="w-5 h-5 text-sky-400" />
            <h2>2. Direct Peer-to-Peer Encryption</h2>
          </div>
          <p className="text-slate-400 mb-3">
            All data traveling between peers via WebRTC is automatically encrypted end-to-end using <strong>Datagram Transport Layer Security (DTLS)</strong> and the <strong>Stream Control Transmission Protocol (SCTP)</strong>.
          </p>
          <p className="text-slate-400">
            Intermediate networks, ISPs, and the signaling server cannot view, inspect, or reconstruct the contents of your transfer.
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3 text-white font-bold text-base">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2>3. Ephemeral Sessions & One-Time Passwords</h2>
          </div>
          <p className="text-slate-400 mb-3">
            When a transfer room is generated, a 6-digit cryptographic OTP is created. The backend stores only a securely salted SHA-256 hash in volatile RAM.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 mb-3 ml-2">
            <li>Rooms automatically expire after 15 minutes of inactivity.</li>
            <li>Sessions are immediately destroyed upon transfer completion.</li>
            <li>All memory associated with the transfer session and OTP is purged immediately.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3 text-white font-bold text-base">
            <EyeOff className="w-5 h-5 text-purple-400" />
            <h2>4. No Personal Data or Tracking</h2>
          </div>
          <p className="text-slate-400 mb-3">
            We do not collect names, phone numbers, email addresses, or social accounts. We do not use tracking pixels, advertising identifiers, or third-party behavioral profiling scripts.
          </p>
          <p className="text-slate-400">
            Transient IP addresses are temporarily used for connection rate-limiting (preventing brute-force OTP attacks) and are not linked to any user identity.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-base mb-2">5. Contact & Privacy Inquiries</h2>
          <p className="text-slate-400">
            For questions or feedback regarding our privacy practices, please contact the developer at:
            <br />
            <a href="mailto:dineshchitturu2005@gmail.com" className="text-sky-400 hover:underline font-medium">
              dineshchitturu2005@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
