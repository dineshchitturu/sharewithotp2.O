import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, ShieldCheck, Lock, Trash2 } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: 'send' | 'receive') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-16">
      {/* Hero Header matching reference image typography */}
      <div className="text-center mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero Server Storage</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 max-w-2xl mx-auto leading-[1.12] font-sans">
          Share Text or Files<br className="hidden sm:inline" /> Between Devices Instantly
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
          Generate a secure one-time password to transfer text or files across devices. No login. No accounts.
        </p>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
        {/* Send Card */}
        <button
          onClick={() => onNavigate('send')}
          className="group relative flex flex-col items-start p-8 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 shadow-xl hover:shadow-sky-500/10 transition-all duration-300 text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all mb-6">
            <ArrowUpCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Send File</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Select your file, get a secure 6-digit OTP, and stream files directly to the receiver.
          </p>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-sky-400 group-hover:text-sky-300">
            Create Transfer →
          </span>
        </button>

        {/* Receive Card */}
        <button
          onClick={() => onNavigate('receive')}
          className="group relative flex flex-col items-start p-8 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all mb-6">
            <ArrowDownCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Receive File</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Enter the sender&apos;s 6-digit OTP to establish an encrypted P2P data connection and download.
          </p>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 group-hover:text-emerald-300">
            Receive File →
          </span>
        </button>
      </div>

      {/* Security Principles & Guarantees */}
      <div className="border-t border-slate-800/80 pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">No Server Storage</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Files travel directly peer-to-peer. The backend never accepts, saves, or proxies file contents.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Cryptographic OTP</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              OTPs are hashed and salted. Verification is limited to 5 attempts to prevent brute-force attacks.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start">
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
    </div>
  );
};
