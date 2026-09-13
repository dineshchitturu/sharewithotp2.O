import React from 'react';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface TermsConditionsProps {
  onBack: () => void;
}

export const TermsConditions: React.FC<TermsConditionsProps> = ({ onBack }) => {
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
          ShareWithOTP2.O • Terms & Conditions
        </span>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <FileText className="w-3.5 h-3.5" />
          <span>Legal & Usage Terms</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Terms & Conditions
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Effective Date: September 13, 2026 • ShareWithOTP2.O
        </p>
      </div>

      <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-base mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p className="text-slate-400">
            By accessing or using <strong>ShareWithOTP2.O</strong>, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree, please discontinue using the service immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-base mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>2. Nature of the Service</span>
          </h2>
          <p className="text-slate-400 mb-2">
            ShareWithOTP2.O provides a free, temporary, browser-based peer-to-peer (P2P) file transfer technology powered by WebRTC.
          </p>
          <p className="text-slate-400">
            The platform facilitates direct connections between sender and receiver browsers. <strong>No files are ever hosted, stored, archived, or retained on our infrastructure.</strong>
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-base mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>3. Acceptable Use Policy</span>
          </h2>
          <p className="text-slate-400 mb-2">
            You agree to use ShareWithOTP2.O strictly for lawful purposes. You agree not to use the service to transmit:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
            <li>Malware, viruses, spyware, trojans, or malicious payloads</li>
            <li>Content that infringes upon copyright, trademarks, or intellectual property</li>
            <li>Unlawful, harassing, defamatory, or harmful material</li>
            <li>Automated attacks, brute-force requests, or denial-of-service attempts</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-base mb-2">4. Disclaimer of Warranty & Limitation of Liability</h2>
          <p className="text-slate-400 mb-2">
            The service is provided on an <strong>&ldquo;AS IS&rdquo;</strong> and <strong>&ldquo;AS AVAILABLE&rdquo;</strong> basis without warranties of any kind, whether express or implied.
          </p>
          <p className="text-slate-400">
            Because transfers occur directly between devices over public internet networks, we cannot guarantee uninterrupted service, transfer speeds, or continuous compatibility across all NAT and firewall topologies. Under no circumstances shall the developer or contributors be liable for any direct, indirect, or consequential damages resulting from use of the service.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-base mb-2">5. Contact Information</h2>
          <p className="text-slate-400">
            If you have questions regarding these terms, contact:
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
