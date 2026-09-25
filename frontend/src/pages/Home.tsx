import React from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldCheck,
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
  Layers,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { TransferCanvas } from '../three/TransferCanvas';

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
      icon: <KeyRound className="w-6 h-6 text-cyan-400" />,
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
    <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-20">
      {/* ======================================================== */}
      {/* SECTION 1: MASTERPIECE OCEAN GLASS HERO CONTAINER        */}
      {/* (Faithfully recreating the 2nd Reference Image)          */}
      {/* ======================================================== */}
      <section id="home" className="scroll-mt-24">
        {/* Giant Panoramic Curved Glass Container */}
        <div className="relative rounded-[32px] sm:rounded-[36px] glass-panel border border-white/15 p-6 sm:p-10 md:p-12 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7),0_0_40px_rgba(6,182,212,0.15)] overflow-hidden mb-8">
          {/* Subtle underwater caustic gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

          {/* Interior Grid: 2 Columns matching 2nd Reference Image */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* LEFT COLUMN: Hero content, 3-line stacked title, buttons & feature chips */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
              
              {/* Badge Pill (matching "Dive Into a Better World") */}
              <div className="badge-luminous-pill">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>✦ Direct WebRTC P2P • Zero Server Storage</span>
              </div>

              {/* Bold Stacked Headline (matching "Discover. Experience. Protect.") */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08] font-sans">
                  <span className="block">Direct.</span>
                  <span className="block">Instant.</span>
                  <span className="block bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(6,182,212,0.35)]">
                    Protected.
                  </span>
                </h1>
              </div>

              {/* Subordinate text */}
              <p className="text-sm sm:text-base text-slate-300 max-w-lg font-normal leading-relaxed">
                Step into zero-knowledge peer-to-peer file sharing. Stream files of any size directly between browsers with ephemeral 6-digit OTP verification and zero footprint.
              </p>

              {/* Action Buttons (matching [Dive In ->] and [▷ Watch Story]) */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('send')}
                  className="btn-luminous-pill text-sm px-6 py-3.5 gap-2 shadow-xl shadow-cyan-500/25 cursor-pointer"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>Send a File</span>
                  <span className="text-cyan-200">→</span>
                </button>

                <button
                  onClick={() => onNavigate('receive')}
                  className="btn-glass-pill text-sm px-6 py-3.5 gap-2 text-cyan-200 border-cyan-400/30 hover:bg-cyan-950/40 hover:border-cyan-300/50 cursor-pointer"
                >
                  <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                  <span>Receive File</span>
                  <span className="text-emerald-300">↓</span>
                </button>
              </div>

              {/* 3 Glass Feature Chips (matching Eco Friendly, Premium Service, Safe & Secure) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-4 border-t border-white/10">
                <div className="glass-feature-card p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">Zero Storage</h4>
                    <p className="text-[10px] text-slate-400 truncate">100% Direct P2P</p>
                  </div>
                </div>

                <div className="glass-feature-card p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">Ephemeral OTP</h4>
                    <p className="text-[10px] text-slate-400 truncate">Salted SHA-256</p>
                  </div>
                </div>

                <div className="glass-feature-card p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">Fast Streaming</h4>
                    <p className="text-[10px] text-slate-400 truncate">1 MB Chunk Slices</p>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: 3D Visualizer / Interactive Showcase */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="w-full aspect-square max-w-[380px] rounded-3xl bg-gradient-to-b from-[#091833]/80 to-[#061022]/90 border border-cyan-500/25 p-4 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
                {/* Internal ambient radial glow */}
                <div className="absolute inset-0 bg-radial-gradient from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
                
                {/* 3D WebRTC Canvas */}
                <div className="w-full h-full relative z-10 flex items-center justify-center">
                  <TransferCanvas status="idle" />
                </div>

                {/* Floating Status Pill over the 3D visual */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-[#061226]/85 border border-cyan-400/30 backdrop-blur-md shadow-lg shadow-black/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-mono text-cyan-200">P2P Network Active</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Floating Glass Pill Bar (Directly matching bottom strip in 2nd Reference Image) */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-pill-bar px-6 py-4 flex flex-wrap items-center justify-around gap-4 text-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight">Direct P2P</span>
                <span className="text-[10px] text-slate-400 font-medium">0 Server Storage</span>
              </div>
            </div>

            <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight">6-Digit OTP</span>
                <span className="text-[10px] text-slate-400 font-medium">Salted SHA-256</span>
              </div>
            </div>

            <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight">1 MB Slices</span>
                <span className="text-[10px] text-slate-400 font-medium">DTLS Encrypted</span>
              </div>
            </div>

            <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <InfinityIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight">100% Free</span>
                <span className="text-[10px] text-slate-400 font-medium">No Account Needed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: ABOUT SECTION (#about)                        */}
      {/* ======================================================== */}
      <section id="about" className="scroll-mt-24 border-t border-white/10 pt-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="badge-luminous-pill">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Developer & Architecture</span>
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            About ShareWithOTP
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            A zero-knowledge, browser-to-browser temporary file sharing engine built with modern WebRTC, FastAPI, and cryptographic OTP verification.
          </p>
        </div>

        {/* Developer Profile Card */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar Badge */}
            <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-xl shadow-cyan-500/25 border border-white/25 shrink-0">
              DC
            </div>

            {/* Details */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Dinesh Chitturu</h3>
                  {/* <p className="text-xs font-semibold text-cyan-400">Creator & Systems Developer</p> */}
                  <p> 

                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono self-center sm:self-auto shadow-sm">
                  {/* <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> */}
                  {/* <span>Online & Active</span> */}
                </div>
              </div>

              {/* <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 max-w-xl">
                Passionate about privacy-preserving architectures, real-time distributed protocols, and zero-knowledge data pipelines.
              </p> */}

              {/* Contact & Social Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <a
                  href="mailto:dineshchitturu2005@gmail.com"
                  className="btn-glass-pill text-xs px-3.5 py-1.5 gap-2 text-slate-200"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>dineshchitturu2005@gmail.com</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/dinesh-chitturu-b4152b38b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glass-pill text-xs px-3.5 py-1.5 gap-2 text-slate-200"
                >
                  <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href="https://github.com/dineshchitturu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glass-pill text-xs px-3.5 py-1.5 gap-2 text-slate-200"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-slate-300" />
                  <span>GitHub @dineshchitturu</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-feature-card p-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4 shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base mb-2">Direct P2P DataChannels</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Files stream chunk-by-chunk directly through browser-to-browser SCTP channels with DTLS encryption. The backend never touches the file data.
            </p>
          </div>

          <div className="glass-feature-card p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base mb-2">Ephemeral OTP Authentication</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              6-digit one-time passwords stored exclusively as cryptographically salted hashes. Sessions automatically expire in 15 minutes and destroy upon completion.
            </p>
          </div>

          <div className="glass-feature-card p-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4 shadow-md">
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
      <section id="how-it-works" className="scroll-mt-24 border-t border-white/10 pt-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="badge-luminous-pill">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>5-Step Workflow</span>
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            How P2P File Sharing Works
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Learn how ShareWithOTP streams large files directly between devices without uploading or storing a single byte on a server.
          </p>
        </div>

        {/* Steps Walkthrough */}
        <div className="space-y-4 mb-14">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6 glass-panel-interactive rounded-2xl"
            >
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-lg font-mono font-black text-cyan-400/70 sm:w-8">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-[#071329] border border-white/15 flex items-center justify-center shadow-inner">
                  {item.icon}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison: Traditional vs ShareWithOTP */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 mb-12 relative overflow-hidden">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Traditional Cloud Sharing vs ShareWithOTP
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3 text-rose-400 font-semibold text-sm">
                <XCircle className="w-4 h-4" />
                <span>Traditional Cloud Uploads</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">• <span>File is uploaded to and saved on a central third-party server</span></li>
                <li className="flex items-start gap-1.5">• <span>Double bandwidth cost: Upload to cloud, then download from cloud</span></li>
                <li className="flex items-start gap-1.5">• <span>Files persist in databases or buckets until manually deleted</span></li>
                <li className="flex items-start gap-1.5">• <span>Vulnerable to server data breaches and unauthorized access</span></li>
                <li className="flex items-start gap-1.5">• <span>Requires account creation or email verification</span></li>
              </ul>
            </div>

            {/* ShareWithOTP */}
            <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.1)]">
              <div className="flex items-center gap-2 mb-3 text-cyan-300 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>ShareWithOTP Direct P2P</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-start gap-1.5">• <span>Direct browser-to-browser WebRTC DataChannel streaming</span></li>
                <li className="flex items-start gap-1.5">• <span>Single direct transit: Fast local or global transfer speed</span></li>
                <li className="flex items-start gap-1.5">• <span>Zero server file storage: Files never touch backend disk</span></li>
                <li className="flex items-start gap-1.5">• <span>Ephemeral 6-digit OTP destroyed immediately after transfer</span></li>
                <li className="flex items-start gap-1.5">• <span>Completely anonymous: No signup, cookies, or account required</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Action CTA */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-950/50">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Ready to Transfer Securely?</h3>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md mx-auto">
            Choose whether to share a file with someone or receive a file with a 6-digit code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('send')}
              className="w-full sm:w-auto btn-luminous-pill px-8 py-3.5 text-sm gap-2 cursor-pointer"
            >
              <span>Send a File Now</span>
              <span>→</span>
            </button>
            <button
              onClick={() => onNavigate('receive')}
              className="w-full sm:w-auto btn-glass-pill px-8 py-3.5 text-sm gap-2 border-emerald-400/40 text-emerald-300 hover:bg-emerald-950/30 cursor-pointer"
            >
              <span>Receive a File</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
