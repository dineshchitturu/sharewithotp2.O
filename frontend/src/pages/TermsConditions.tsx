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
          className="btn-sm btn-secondary gap-1.5 cursor-pointer text-gray-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-mono text-gray-500">
          ShareWithOTP2.O • Terms & Conditions
        </span>
      </div>

      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Legal & Usage Terms</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
          Terms & Conditions
        </h1>
        <p className="text-xs text-gray-500 font-mono">
          Effective Date: September 13, 2026 • ShareWithOTP2.O
        </p>
      </div>

      <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="simple-card rounded-2xl p-6 sm:p-8 bg-white">
          <h2 className="text-gray-900 font-bold text-base mb-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>1. Acceptance of Terms</span>
          </h2>
          <p className="text-gray-600">
            By accessing or using <strong className="text-gray-900">ShareWithOTP2.O</strong>, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree, please discontinue using the service immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="simple-card rounded-2xl p-6 sm:p-8 bg-white">
          <h2 className="text-gray-900 font-bold text-base mb-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span>2. Nature of the Service</span>
          </h2>
          <p className="text-gray-600 mb-2">
            ShareWithOTP2.O is a free peer-to-peer browser-based file transfer utility. The server facilitates cryptographic signaling and connection coordination only.
          </p>
          <p className="text-gray-500">
            Because files are transferred directly between peers via WebRTC, ShareWithOTP2.O does not monitor, inspect, store, or retain any transmitted content.
          </p>
        </section>

        {/* Section 3 */}
        <section className="simple-card rounded-2xl p-6 sm:p-8 bg-white">
          <h2 className="text-gray-900 font-bold text-base mb-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span>3. Acceptable Use Policy</span>
          </h2>
          <p className="text-gray-600 mb-2">
            You agree not to use the service for any unlawful purpose, including but not limited to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-500 mb-2 ml-2">
            <li>Transferring malicious software, viruses, trojans, or ransomware.</li>
            <li>Distributing material that infringes intellectual property or copyrights.</li>
            <li>Attempting denial-of-service or brute-force attacks against signaling relays.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="simple-card rounded-2xl p-6 sm:p-8 bg-white">
          <h2 className="text-gray-900 font-bold text-base mb-2">4. Disclaimer of Warranties</h2>
          <p className="text-gray-600 mb-2">
            The service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, either express or implied.
          </p>
          <p className="text-gray-500">
            We do not warrant that file transfers will be uninterrupted, error-free, or meet specific throughput requirements across varied NAT topologies.
          </p>
        </section>

        {/* Section 5 */}
        <section className="simple-card rounded-2xl p-6 sm:p-8 bg-white">
          <h2 className="text-gray-900 font-bold text-base mb-2">5. Contact Information</h2>
          <p className="text-gray-500">
            If you have questions regarding these terms, please contact:
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
