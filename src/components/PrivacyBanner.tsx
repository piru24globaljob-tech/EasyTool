import React from 'react';
import { ShieldCheck, Lock, Trash2, Zap } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <section className="bg-blue-50/70 backdrop-blur-md border-y border-blue-100 text-slate-700 py-6 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
              Privacy First File Processing Guaranteed
            </h4>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed mt-0.5">
              Your documents and images are processed completely in-memory in isolated container runtimes. Files are automatically destroyed immediately after processing — no permanent data logging.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-150 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-blue-600" /> End-to-End SSL Encryption
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-150 shadow-2xs">
            <Trash2 className="w-3.5 h-3.5 text-amber-600" /> Auto-Purge Memory
          </div>
        </div>
      </div>
    </section>
  );
};
