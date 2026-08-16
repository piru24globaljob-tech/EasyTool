import React from 'react';
import { ShieldCheck, Lock, Trash2, Zap } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 backdrop-blur-md border-y border-blue-200/80 text-slate-700 py-8 px-4 sm:px-6 lg:px-8 relative z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-blue-500 to-indigo-600 border-t border-white/60 border-b-2 border-indigo-900 text-white flex items-center justify-center shrink-0 shadow-[0_10px_20px_-3px_rgba(37,99,235,0.4)] animate-float-3d">
            <ShieldCheck className="w-7 h-7 drop-shadow-md text-sky-200" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-base font-display flex items-center gap-2 tracking-tight">
              Privacy-First In-Memory 3D File Processing
            </h4>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed mt-1">
              Your documents and images are processed completely in-memory in isolated sandboxed runtimes. Files are automatically purged immediately upon completion — zero telemetry, zero storage logging.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700 shrink-0">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 border-b-2 border-b-slate-300 shadow-[0_4px_8px_rgba(0,0,0,0.05)]">
            <Lock className="w-4 h-4 text-blue-600" /> End-to-End SSL Encryption
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 border-b-2 border-b-slate-300 shadow-[0_4px_8px_rgba(0,0,0,0.05)]">
            <Trash2 className="w-4 h-4 text-amber-600" /> Auto-Purge Memory
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 border-b-2 border-b-emerald-300 shadow-[0_4px_8px_rgba(16,185,129,0.1)]">
            <Zap className="w-4 h-4 text-emerald-600" /> Real-time Acceleration
          </div>
        </div>
      </div>
    </section>
  );
};
