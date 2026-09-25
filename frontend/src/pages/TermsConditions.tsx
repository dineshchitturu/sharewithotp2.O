import React from 'react';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface TermsConditionsProps {
  onBack: () => void;
}

export const TermsConditions: React.FC<TermsConditionsProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 md:py-14">
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
          ShareWithOTP2.O • Terms & Conditions
        </span>
      </div>

      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="badge-luminous-pill">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Legal & Usage Terms</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          Terms & Conditions
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Effective Date: September 13, 2026 • ShareWithOTP2.O
        </p>
      </div>

      <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="text-white font-bold text-base mb-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>1. Acceptance of Terms</span>
          </h2>
          <p className="text-slate-300">
            By accessing or using <strong className="text-white">ShareWithOTP2.O</strong>, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree, please discontinue using the service immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="text-white font-bold text-base mb-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span>2. Nature of the Service</span>
          </h2>
          <p className="text-slate-300 mb-2">
            ShareWithOTP2.O provides a free, temporary, browser-based peer-to-peer (P2P) file transfer technology powered by WebRTC.
          </p>
          <p className="text-slate-400">
            The platform facilitates direct connections between sender and receiver browsers. <strong className="text-white">No files are ever hosted, stored, archived, or retained on our infrastructure.</strong>
          </p>
        </section>

        {/* Section 3 */}
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="text-white font-bold text-base mb-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/70 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span>3. Acceptable Use Policy</span>
          </h2>
          <p className="text-slate-300 mb-2">
            You agree to use ShareWithOTP2.O strictly for lawful purposes. You agree not to use the service to transmit:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
            <li>Malware, viruses, spyware, trojans, or malicious payloads</li>
            <li>Content that infringes upon copyright, trademarks, or intellectual property</li>
            <li>Unlawful, harassing, defamatory, or harmful material</li>
            <li>Automated attacks, brute-force requests, or denial-of-service attempts</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="text-white font-bold text-base mb-2">4. Disclaimer of Warranty & Limitation of Liability</h2>
          <p className="text-slate-300 mb-2">
            The service is provided on an <strong className="text-white">&ldquo;AS IS&rdquo;</strong> and <strong className="text-white">&ldquo;AS AVAILABLE&rdquo;</strong> basis without warranties of any kind, whether express or implied.
          </p>
          <p className="text-slate-400">
            Because transfers occur directly between devices over public internet networks, we cannot guarantee uninterrupted service, transfer speeds, or continuous compatibility across all NAT and firewall topologies. Under no circumstances shall the developer or contributors be liable for any direct, indirect, or consequential damages resulting from use of the service.
          </p>
        </section>

        {/* Section 5 */}
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="text-white font-bold text-base mb-2">5. Contact Information</h2>
          <p className="text-slate-400">
            If you have questions regarding these terms, contact:
            <br />
            <a href="mailto:dineshchitturu2005@gmail.com" className="text-cyan-400 hover:underline font-medium mt-1 inline-block">
              dineshchitturu2005@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
