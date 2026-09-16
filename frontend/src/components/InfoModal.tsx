import { useEffect } from 'react';
import {
  X,
  Mail,
  Shield,
  ShieldCheck,
  Cpu,
  Zap,
  ExternalLink,
  Lock,
  EyeOff,
  ServerOff,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  type: 'about' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

const GithubIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const LinkedinIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, type, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl z-10 my-8 overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              ShareWithOTP2.O
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed">
          {type === 'about' && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Developer & Architect</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  About Dinesh Chitturu & ShareWithOTP2.O
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-2">
                  Zero-knowledge, browser-to-browser temporary file sharing engine built with modern WebRTC, FastAPI, and cryptographic OTP verification.
                </p>
              </div>

              {/* Profile Card */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan-500/20 shrink-0">
                    DC
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-white">Dinesh Chitturu</h3>
                    <p className="text-xs font-mono text-cyan-400 mt-0.5">
                      Lead Architect & Full-Stack Engineer
                    </p>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      Passionate about high-performance, privacy-first distributed web systems. Designed and implemented <strong>ShareWithOTP2.O</strong> to free users from cloud storage dependencies and data retention.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <a
                        href="mailto:dineshchitturu2005@gmail.com"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        <span>dineshchitturu2005@gmail.com</span>
                      </a>
                      <a
                        href="https://www.linkedin.com/in/dinesh-chitturu-b4152b38b/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono transition-colors"
                      >
                        <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                      <a
                        href="https://github.com/dineshchitturu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono transition-colors"
                      >
                        <GithubIcon className="w-3.5 h-3.5 text-slate-300" />
                        <span>GitHub</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <Zap className="w-4 h-4 text-cyan-400 mb-2" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                    Direct P2P Speed
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    64 KB chunks stream directly peer-to-peer with zero proxy bottleneck.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <Shield className="w-4 h-4 text-emerald-400 mb-2" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                    Ephemeral Sessions
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    One-time codes expire in 15 mins and self-destruct upon delivery.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <Cpu className="w-4 h-4 text-indigo-400 mb-2" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                    SHA-256 Integrity
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Streaming checksum guarantees zero corruption or packet tampering.
                  </p>
                </div>
              </div>
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy Policy</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
                <p className="text-xs text-slate-500 font-mono">Last Updated: September 2026</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <ServerOff className="w-4 h-4 text-emerald-400" />
                  <span>1. Zero Server Storage</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your files are NEVER uploaded to, saved on, inspected by, or stored in any server, database, or disk. Data streams chunk-by-chunk directly in RAM between sender and receiver browsers via WebRTC DataChannels.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>2. Peer-to-Peer Encryption</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All peer data is automatically encrypted end-to-end using Datagram Transport Layer Security (DTLS) and Stream Control Transmission Protocol (SCTP). Intermediate networks and signaling relays cannot inspect file data.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>3. Ephemeral Sessions</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Rooms auto-expire after 15 minutes, with sessions immediately destroyed upon transfer completion. All volatile memory associated with the OTP is purged.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <EyeOff className="w-4 h-4 text-purple-400" />
                  <span>4. No User Tracking</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We do not collect names, emails, phone numbers, or analytics profiling cookies. You enjoy 100% anonymous file sharing.
                </p>
              </div>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Terms & Conditions</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Terms of Use</h2>
                <p className="text-xs text-slate-500 font-mono">Effective: September 2026</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>1. Nature of the Service</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ShareWithOTP2.O provides a free, temporary, browser-based peer-to-peer file transfer engine powered by WebRTC. No files are ever hosted, stored, archived, or retained on our infrastructure.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>2. Acceptable Use Policy</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You agree to use ShareWithOTP2.O strictly for lawful purposes. You may not use the service to transmit malware, malicious payloads, infringing copyrighted materials, or harmful content.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  3. Disclaimer of Warranty
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind. Because transfers happen directly between peers across public networks, we cannot guarantee continuous service across all NAT and firewall configurations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
