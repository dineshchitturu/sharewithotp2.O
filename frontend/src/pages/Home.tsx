import React from 'react';
import {
  ShieldCheck,
  Zap,
  KeyRound,
  Radio,
  Network,
  Download,
  CheckCircle2,
  XCircle,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { TransferCanvas } from '../three/TransferCanvas';

interface HomeProps {
  onNavigate: (view: 'send' | 'receive') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {

  const steps = [
    {
      step: '01',
      icon: <KeyRound className="w-5 h-5 text-blue-400" />,
      title: 'Sender Generates Ephemeral 6-Digit OTP',
      desc: 'The sender selects a file of any size and clicks Generate Code. The backend creates a random 6-digit one-time password stored only as a salted SHA-256 hash in volatile RAM.',
    },
    {
      step: '02',
      icon: <Radio className="w-5 h-5 text-indigo-400" />,
      title: 'Receiver Authenticates with OTP',
      desc: 'The receiver enters the 6-digit OTP. The backend validates the salted hash with brute-force rate-limiting and issues a single-use WebRTC signaling ticket.',
    },
    {
      step: '03',
      icon: <Network className="w-5 h-5 text-cyan-400" />,
      title: 'WebRTC P2P Handshake',
      desc: 'Both browsers connect to a lightweight signaling relay over WebSockets to exchange SDP offers and ICE candidates. No file bytes ever pass through this channel.',
    },
    {
      step: '04',
      icon: <Download className="w-5 h-5 text-emerald-400" />,
      title: 'Direct Browser-to-Browser Streaming',
      desc: 'An encrypted RTCDataChannel connects directly between the two browsers. The file streams in 1 MB chunks and 64 KB SCTP transport slices with adaptive backpressure.',
    },
    {
      step: '05',
      icon: <CheckCircle2 className="w-5 h-5 text-teal-400" />,
      title: 'Integrity Verification & Destruction',
      desc: 'The receiver validates the SHA-256 digest against the sender’s trailer, builds the download blob, and triggers immediate destruction of the temporary room.',
    },
  ];

  return (
    <div className="w-full">
      {/* ======================================================== */}
      {/* SECTION 1: HERO HOME (Cruip Simple Template)             */}
      {/* ======================================================== */}
      <section id="home" className="relative pt-8 pb-16 md:pt-14 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            


            {/* Main Headline */}
            <h1 className="mb-6 border-y border-gray-200/80 [border-image:linear-gradient(to_right,transparent,var(--color-gray-300),transparent)1] py-3 text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.12]">
              The fastest P2P file transfer <br className="hidden sm:inline" />
              you've been looking for
            </h1>

            {/* Subordinate Body Text */}
            <p className="mb-8 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              ShareWithOTP2.O streams large files directly between browsers using encrypted WebRTC DataChannels and ephemeral 6-digit one-time passwords. 100% private with zero server storage.
            </p>

            {/* Action Buttons Row with border-y */}
            <div className="relative mb-14 py-2 before:pointer-events-none before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,var(--color-gray-300),transparent)1]">
              <div className="relative z-10 mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('send')}
                  className="btn group w-full sm:w-auto btn-primary py-3 px-6 text-sm font-semibold cursor-pointer shadow-md relative z-10"
                >
                  <span className="relative inline-flex items-center">
                    Send a File Now{' '}
                    <span className="ml-1.5 tracking-normal text-blue-200 transition-transform group-hover:translate-x-1">
                      -&gt;
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('receive')}
                  className="btn w-full sm:w-auto btn-secondary py-3 px-6 text-sm font-semibold cursor-pointer hover:border-gray-300 relative z-10"
                >
                  <span className="relative inline-flex items-center">
                    Receive with 6-Digit OTP
                  </span>
                </button>
              </div>
            </div>

            {/* ======================================================== */}
            {/* HERO TERMINAL / INTERACTIVE 3D SHOWCASE                  */}
            {/* (Cruip Simple Terminal Container)                        */}
            {/* ======================================================== */}
            <div className="mx-auto max-w-4xl">
              <div className="relative rounded-2xl bg-gray-900 p-4 sm:p-6 shadow-2xl before:pointer-events-none before:absolute before:-inset-4 sm:before:-inset-5 before:border-y before:[border-image:linear-gradient(to_right,transparent,var(--color-gray-300),transparent)1] after:absolute after:-inset-4 sm:after:-inset-5 after:-z-10 after:border-x after:[border-image:linear-gradient(to_bottom,transparent,var(--color-gray-300),transparent)1] text-left">
                
                {/* Window top dots + URL */}
                <div className="relative mb-6 flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <div className="px-3 py-1 rounded-md bg-gray-800/80 text-[11px] font-mono text-gray-400 border border-gray-700/50">
                    sharewithotp.io/transfer
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="hidden sm:inline">P2P Network Active</span>
                  </div>
                </div>

                {/* Grid: Left Terminal Log + Right 3D Visualizer */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Left: Terminal Output */}
                  <div className="lg:col-span-7 font-mono text-xs sm:text-sm text-gray-400 space-y-2 leading-relaxed">
                    <div className="text-gray-300 flex items-center gap-2">
                      <span className="text-blue-400">$</span>
                      <span>sharewithotp stream --file presentation.mp4</span>
                    </div>
                    <div className="text-gray-500 pl-4">
                      File size: <span className="text-gray-300">1.48 GB</span> • Chunks: <span className="text-gray-300">1,515 x 1 MB</span>
                    </div>
                    <div className="text-blue-400 pl-4">
                      Ephemeral OTP: <span className="text-white font-bold tracking-widest bg-gray-800 px-2 py-0.5 rounded border border-gray-700">842 190</span> (expires in 15m)
                    </div>
                    <div className="text-indigo-300 pl-4">
                      Receiver connected via WebRTC DataChannel (DTLS-SRTP)
                    </div>
                    <div className="text-emerald-400 pl-4 flex items-center gap-2">
                      <span>Streaming direct P2P:</span>
                      <span className="text-white font-bold">48.2 MB/s</span>
                      <span className="text-gray-500">[====================] 100%</span>
                    </div>
                    <div className="text-gray-400 pl-4 text-xs">
                      SHA-256 Checksum: <span className="text-teal-300">e3b0c44298fc1c149afbf4c8... [MATCHED]</span>
                    </div>
                    <div className="text-gray-500 pl-4 text-xs italic">
                      Transfer complete. Volatile memory scrubbed. Zero server storage.
                    </div>
                  </div>

                  {/* Right: 3D WebRTC Canvas */}
                  <div className="lg:col-span-5 flex flex-col items-center justify-center">
                    <div className="w-full aspect-square max-w-[280px] sm:max-w-[320px] rounded-xl bg-gray-950/70 border border-gray-800 p-2 relative overflow-hidden flex items-center justify-center shadow-inner">
                      <div className="w-full h-full relative z-10">
                        <TransferCanvas status="idle" />
                      </div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full bg-gray-900/90 border border-gray-700 text-[10px] font-mono text-cyan-300 shadow">
                        Live WebRTC Mesh
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: BUSINESS CATEGORIES / CORE PILLARS            */}
      {/* (Cruip Simple business-categories.tsx style)             */}
      {/* ======================================================== */}
      <section id="about" className="py-16 md:py-24 border-t border-gray-100 bg-gray-50/50 relative overflow-hidden">
        
        {/* Subtle grid lines matching Cruip template */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply" />
        
        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight md:text-4xl mb-4">
              Engineered for extreme privacy & speed
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Traditional cloud storage holds your files on centralized databases. ShareWithOTP2.O coordinates direct device-to-device transport where the server never receives file content.
            </p>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="simple-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">Direct P2P DataChannels</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Files stream chunk-by-chunk through browser-to-browser SCTP channels with DTLS encryption. Single-transit latency with no double bandwidth penalty.
              </p>
            </div>

            <div className="simple-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">Ephemeral 6-Digit OTP</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                One-time passwords stored exclusively as cryptographically salted SHA-256 hashes in volatile memory. Auto-expire in 15 minutes and destroy on completion.
              </p>
            </div>

            <div className="simple-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">Streaming SHA-256</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Both peers compute cryptographic SHA-256 digests in real-time via WebAssembly to verify byte-for-byte integrity before file assembly.
              </p>
            </div>

            <div className="simple-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <InfinityIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">100% Free & No Account</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                No signups, no credit cards, no tracking cookies, and no file size paywalls. Send 100 MB, 1 GB, or 10 GB with full browser memory efficiency.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: DARK HOW IT WORKS SECTION                     */}
      {/* (Cruip Simple FeaturesPlanet template style)             */}
      {/* ======================================================== */}
      <section id="how-it-works" className="relative py-20 md:py-28 before:absolute before:inset-0 before:-z-20 before:bg-gray-900 text-gray-200 overflow-hidden">
        
        {/* Glow & Planet background elements matching Cruip template */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" aria-hidden="true">
          <div className="h-96 w-96 rounded-full bg-blue-600 opacity-20 blur-[160px]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          
          {/* Section Header */}
          <div className="mx-auto max-w-3xl pb-14 text-center md:pb-18">
            <h2 className="text-3xl font-bold text-white tracking-tight md:text-4xl mb-4">
              How P2P file sharing works under the hood
            </h2>
            <p className="text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
              Step into zero-knowledge architecture. From one-time password generation to WebAssembly checksum verification.
            </p>
          </div>

          {/* Cruip Planet / Network Central Graphic */}
          <div className="pb-16 text-center">
            <div className="relative inline-flex rounded-full before:absolute before:inset-0 before:-z-10 before:scale-[.85] before:animate-[pulse_4s_cubic-bezier(.4,0,.6,1)_infinite] before:bg-gradient-to-b before:from-blue-900 before:to-sky-700/50 before:blur-3xl">
              <img
                className="rounded-full bg-gray-900 w-56 h-56 sm:w-72 sm:h-72 object-cover border border-blue-500/30 shadow-2xl"
                src="/images/planet.png"
                alt="WebRTC P2P Planet"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <img
                  className="max-w-none opacity-60 animate-[float_5s_ease-in-out_infinite]"
                  src="/images/planet-overlay.svg"
                  width={500}
                  alt="Network rings"
                />
              </div>

              {/* Floating badges around planet */}
              <div className="absolute -left-12 top-6 px-3 py-1.5 rounded-full bg-gray-800/90 border border-blue-400/40 text-xs font-semibold text-blue-300 shadow-lg backdrop-blur-sm animate-[float_4s_ease-in-out_infinite]">
                ✦ Direct Browser P2P
              </div>
              <div className="absolute -right-10 top-12 px-3 py-1.5 rounded-full bg-gray-800/90 border border-emerald-400/40 text-xs font-semibold text-emerald-300 shadow-lg backdrop-blur-sm animate-[float_4s_ease-in-out_infinite_1s]">
                ✦ Zero Server Storage
              </div>
              <div className="absolute left-4 bottom-2 px-3 py-1.5 rounded-full bg-gray-800/90 border border-indigo-400/40 text-xs font-semibold text-indigo-300 shadow-lg backdrop-blur-sm animate-[float_4s_ease-in-out_infinite_2s]">
                ✦ 6-Digit Salted OTP
              </div>
            </div>
          </div>

          {/* 5-Step Process Grid with Hairline Dividers (Cruip features grid style) */}
          <div className="grid overflow-hidden sm:grid-cols-2 lg:grid-cols-3 *:relative *:p-6 *:before:absolute *:before:bg-gray-800 *:before:[block-size:100vh] *:before:[inline-size:1px] *:before:[inset-block-start:0] *:before:[inset-inline-start:-1px] *:after:absolute *:after:bg-gray-800 *:after:[block-size:1px] *:after:[inline-size:100vw] *:after:[inset-block-start:-1px] *:after:[inset-inline-start:0] md:*:p-8 mb-16 border-t border-gray-800">
            {steps.map((item, idx) => (
              <article key={idx} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                    Step {item.step}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-white text-base">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </article>
            ))}

            <article className="space-y-3 bg-blue-950/20">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Verified
                </span>
                <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-semibold text-white text-base">
                Zero Data Residue
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                As soon as the file finishes streaming and the receiver downloads the file, both peers disconnect and all temporary room credentials vanish instantly.
              </p>
            </article>
          </div>

          {/* Comparison Table: Cloud vs ShareWithOTP */}
          <div className="rounded-2xl bg-gray-950/70 border border-gray-800 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Traditional Cloud File Sharing vs ShareWithOTP2.O
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-xl bg-gray-900/80 border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>Traditional Cloud Storage (Drive/Dropbox/WeTransfer)</span>
                </div>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li className="flex items-start gap-1.5">• <span>File is uploaded and stored on central corporate servers</span></li>
                  <li className="flex items-start gap-1.5">• <span>Double bandwidth: Sender uploads to cloud, receiver downloads from cloud</span></li>
                  <li className="flex items-start gap-1.5">• <span>Files remain indefinitely on disks until manually purged</span></li>
                  <li className="flex items-start gap-1.5">• <span>Requires email address, user registration, or paid tier</span></li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-gray-900/80 border border-blue-500/30 space-y-3 shadow-lg shadow-blue-500/5">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ShareWithOTP2.O Direct P2P</span>
                </div>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li className="flex items-start gap-1.5">• <span>Direct browser-to-browser WebRTC DataChannel streaming</span></li>
                  <li className="flex items-start gap-1.5">• <span>Single direct transit: Maximum local network or internet throughput</span></li>
                  <li className="flex items-start gap-1.5">• <span>Zero server storage: File never touches server hard drives</span></li>
                  <li className="flex items-start gap-1.5">• <span>No signup, no login, ephemeral 6-digit OTP destroyed on completion</span></li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </section>



    </div>
  );
};
