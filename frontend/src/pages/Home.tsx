import React from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldCheck,
  Lock,
  Trash2,
  Cpu,
  Zap,
  Shield,
  Mail,
  ExternalLink,
  KeyRound,
  Radio,
  Network,
  Download,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

interface HomeProps {
  onNavigate: (view: 'send' | 'receive') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const steps = [
    {
      step: '01',
      icon: <KeyRound className="w-6 h-6 text-sky-400" />,
      title: 'Sender Generates Ephemeral 6-Digit OTP',
      desc: 'The sender selects their file (> 100 MB supported) and clicks Generate Code. The backend generates a random 6-digit one-time password (OTP) stored only as a salted SHA-256 hash in volatile memory.',
    },
    {
      step: '02',
      icon: <Radio className="w-6 h-6 text-indigo-400" />,
      title: 'Receiver Authenticates with OTP',
      desc: 'The receiver visits ShareWithOTP on their browser, enters the 6-digit OTP (or clicks Unlock Share). The backend validates the salted hash with brute-force rate-limiting and issues a single-use session token.',
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
      desc: 'An encrypted RTCDataChannel connects directly between the two browsers. The file streams in 1 MB chunks and 63 KB SCTP transport slices with adaptive backpressure management.',
    },
    {
      step: '05',
      icon: <CheckCircle2 className="w-6 h-6 text-teal-400" />,
      title: 'Integrity Verification & Destruction',
      desc: 'The receiver verifies the cryptographic hash against the sender’s trailer digest, builds the local file for download, and triggers immediate destruction of the temporary room and credentials.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-24">
      {/* ======================================================== */}
      {/* SECTION 1: HERO / ACTION SECTION (#home)                */}
      {/* ======================================================== */}
      <section id="home" className="scroll-mt-24">
        {/* Hero Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Server Storage • Direct WebRTC P2P</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 max-w-2xl mx-auto leading-[1.12] font-sans">
            Share Large Files<br className="hidden sm:inline" /> Between Devices Instantly
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
            Generate a secure one-time code to stream files directly across browsers. No cloud storage, no account, and zero footprint.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
          {/* Send Card */}
          <button
            onClick={() => onNavigate('send')}
            className="group relative flex flex-col items-start p-8 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 text-left cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all mb-6">
              <ArrowUpCircle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Send File</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Select your file, get a secure 6-digit OTP, and stream files directly to the receiver.
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-sky-400 group-hover:text-sky-300">
              <span>Create Transfer</span>
              <span>→</span>
            </span>
          </button>

          {/* Receive Card */}
          <button
            onClick={() => onNavigate('receive')}
            className="group relative flex flex-col items-start p-8 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 text-left cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all mb-6">
              <ArrowDownCircle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Receive File</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Enter the sender&apos;s 6-digit OTP to establish an encrypted P2P data connection and download.
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 group-hover:text-emerald-300">
              <span>Receive File</span>
              <span>→</span>
            </span>
          </button>
        </div>

        {/* Security Principles & Guarantees */}
        <div className="border-t border-slate-800/80 pt-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">No Server Storage</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Files travel directly peer-to-peer. The backend never accepts, saves, or proxies file contents.
              </p>
            </div>

            <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Cryptographic OTP</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                OTPs are hashed and salted. Verification is rate-limited to 5 attempts to prevent brute-force attacks.
              </p>
            </div>

            <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Temporary Sessions</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transfer sessions self-destruct immediately upon completion. Sessions cannot be reused once destroyed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: ABOUT SECTION (#about)                        */}
      {/* ======================================================== */}
      <section id="about" className="scroll-mt-24 border-t border-slate-800/80 pt-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Developer & Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            About ShareWithOTP
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            A zero-knowledge, browser-to-browser temporary file sharing engine built with modern WebRTC, FastAPI, and cryptographic OTP verification.
          </p>
        </div>

        {/* Developer Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm mb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar / Icon Badge */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-sky-600/30 shrink-0">
              DC
            </div>

            {/* Details */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Dinesh Chitturu</h3>
                  <p className="text-xs font-medium text-sky-400">Creator & Systems Developer</p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/60 border border-slate-800 text-[11px] text-emerald-400 font-mono self-center sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Online & Active</span>
                </div>
              </div>

              {/* Contact & Social Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                <a
                  href="mailto:dineshchitturu2005@gmail.com"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-slate-200 text-xs font-medium transition-all"
                >
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>dineshchitturu2005@gmail.com</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/dinesh-chitturu-b4152b38b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-slate-200 text-xs font-medium transition-all"
                >
                  <LinkedinIcon className="w-4 h-4 text-blue-400" />
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>

                <a
                  href="https://github.com/dineshchitturu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-slate-200 text-xs font-medium transition-all"
                >
                  <GithubIcon className="w-4 h-4 text-slate-300" />
                  <span>GitHub @dineshchitturu</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-sky-950/80 text-sky-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base mb-2">Direct P2P DataChannels</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Files stream chunk-by-chunk directly through browser-to-browser SCTP channels with DTLS encryption. The backend never touches the file data.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base mb-2">Ephemeral OTP Authentication</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              6-digit one-time passwords stored exclusively as cryptographically salted hashes. Sessions automatically expire in 15 minutes and destroy upon completion.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base mb-2">1 MB Chunking & Slicing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-speed standard 1 MB chunking with safe 63 KB SCTP transport slicing ensures smooth transmission across Wi-Fi and mobile networks.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: HOW IT WORKS SECTION (#how-it-works)          */}
      {/* ======================================================== */}
      <section id="how-it-works" className="scroll-mt-24 border-t border-slate-800/80 pt-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Network className="w-3.5 h-3.5" />
            <span>5-Step Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            How P2P File Sharing Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Learn how ShareWithOTP streams large files directly between devices without uploading or storing a single byte on a server.
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

        {/* Comparison: Traditional vs ShareWithOTP */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 mb-12 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Traditional Cloud Sharing vs ShareWithOTP
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="bg-slate-950/70 border border-rose-950/40 rounded-2xl p-5 sm:p-6">
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

            {/* ShareWithOTP */}
            <div className="bg-slate-950/70 border border-emerald-950/40 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3 text-emerald-400 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>ShareWithOTP Direct P2P</span>
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

        {/* Bottom Action CTA */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ready to Transfer Securely?</h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Choose whether to share a file with someone or receive a file with a 6-digit code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('send')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 transition-all shadow-lg shadow-sky-600/25 text-sm cursor-pointer"
            >
              Send a File Now →
            </button>
            <button
              onClick={() => onNavigate('receive')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-emerald-400 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 transition-all text-sm cursor-pointer"
            >
              Receive a File →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
