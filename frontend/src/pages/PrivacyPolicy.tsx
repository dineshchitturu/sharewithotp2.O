import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, ServerOff, Clock } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 md:py-14">
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
          ShareWithOTP2.O • Privacy Policy
        </span>
      </div>

      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Privacy First Architecture</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-500 font-mono">
          Last Updated: September 13, 2026 • ShareWithOTP2.O
        </p>
      </div>

      <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="simple-card rounded-2xl p-6 sm:p-8 bg-white">
          <div className="flex items-center gap-3 mb-3 text-gray-900 font-bold text-base">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ServerOff className="w-4 h-4" />
            </div>
            <h2>1. Zero Server Storage Principle</h2>
          </div>
          <p className="text-gray-600 mb-3">
            ShareWithOTP2.O was architected with privacy as the core requirement. Unlike traditional file sharing or cloud drive services, <strong className="text-gray-900">your files are NEVER uploaded to, saved on, inspected by, or stored in any server, database, or disk.</strong>
          </p>
          <p className="text-gray-500">
            Files stream chunk-by-chunk in memory directly between the sender&apos;s browser and the receiver&apos;s browser using peer-to-peer (P2P) WebRTC DataChannels. The server acts strictly as a lightweight signaling coordinator.
          </p>
        </section>

        {/* Section 2 */}
        <section className="simple-card rounded-2xl p-6 sm:p-8 bg-white">
          <div className="flex items-center gap-3 mb-3 text-gray-900 font-bold text-base">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <h2>2. Direct Peer-to-Peer Encryption</h2>
          </div>
          <p className="text-gray-600 mb-3">
            All data traveling between peers via WebRTC is automatically encrypted end-to-end using <strong className="text-gray-900">Datagram Transport Layer Security (DTLS)</strong> and the <strong className="text-gray-900">Stream Control Transmission Protocol (SCTP)</strong>.
          </p>
          <p className="text-gray-500">
            Intermediate networks, ISPs, and the signaling server cannot view, inspect, or reconstruct the contents of your transfer.
          </p>
        </section>

        {/* Section 3 */}
        <section className="simple-card rounded-2xl p-6 sm:p-8 bg-white">
          <div className="flex items-center gap-3 mb-3 text-gray-900 font-bold text-base">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <h2>3. Ephemeral Sessions & One-Time Passwords</h2>
          </div>
          <p className="text-gray-600 mb-3">
            When a transfer room is generated, a 6-digit cryptographic OTP is created. The backend stores only a securely salted SHA-256 hash in volatile RAM.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-500 mb-3 ml-2">
            <li>Rooms automatically expire after 15 minutes of inactivity.</li>
            <li>Sessions are immediately destroyed upon transfer completion.</li>
            <li>All memory associated with the transfer session and OTP is purged immediately.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="simple-card rounded-2xl p-6 sm:p-8 bg-white">
          <div className="flex items-center gap-3 mb-3 text-gray-900 font-bold text-base">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <EyeOff className="w-4 h-4" />
            </div>
            <h2>4. No Personal Data or Tracking</h2>
          </div>
          <p className="text-gray-600 mb-3">
            We do not collect names, phone numbers, email addresses, or social accounts. We do not use tracking pixels, advertising identifiers, or third-party behavioral profiling scripts.
          </p>
          <p className="text-gray-500">
            Transient IP addresses are temporarily used for connection rate-limiting (preventing brute-force OTP attacks) and are not linked to any user identity.
          </p>
        </section>

        {/* Section 5 */}
        <section className="simple-card rounded-2xl p-6 sm:p-8 bg-white">
          <h2 className="text-gray-900 font-bold text-base mb-2">5. Contact & Privacy Inquiries</h2>
          <p className="text-gray-500">
            For questions or feedback regarding our privacy practices, please contact the developer at:
            <br />
            <a href="mailto:dineshchitturu2005@gmail.com" className="text-blue-600 hover:underline font-medium mt-1 inline-block">
              dineshchitturu2005@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
