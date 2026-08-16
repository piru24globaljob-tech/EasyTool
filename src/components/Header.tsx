import React from 'react';
import { Shield, Crown, CheckCircle2 } from 'lucide-react';
import { UserPlan } from '../types';
import { FileKitLogo } from './FileKitLogo';

interface HeaderProps {
  userPlan: UserPlan;
  setUserPlan: (plan: UserPlan) => void;
  openPricing: () => void;
  activeFileCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  userPlan,
  openPricing,
  activeFileCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-blue-100/80 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <FileKitLogo size="md" showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-slate-900 tracking-tight font-display drop-shadow-2xs">
                TOOLKIT <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-[0_2px_4px_rgba(59,130,246,0.08),inset_0_1px_0_rgba(255,255,255,1)]">
                <Shield className="w-3.5 h-3.5 text-blue-600" /> 100% In-Memory 3D Privacy
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              All Your File Tools. One 3D Workspace.
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeFileCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 shadow-[0_2px_6px_rgba(59,130,246,0.1)] animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{activeFileCount} file(s) in Workspace</span>
            </div>
          )}

          {/* 3D Plan Pill Button */}
          <button
            type="button"
            onClick={openPricing}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              userPlan === 'pro'
                ? 'btn-3d-blue text-white shadow-md'
                : userPlan === 'business'
                ? 'bg-slate-900 text-white border-b-2 border-slate-950 shadow-md'
                : 'btn-3d-white text-slate-700'
            }`}
          >
            <Crown className={`w-3.5 h-3.5 ${userPlan === 'free' ? 'text-amber-500' : 'text-amber-300 drop-shadow-sm'}`} />
            <span className="capitalize">{userPlan} Plan</span>
            {userPlan === 'free' && (
              <span className="ml-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-xs">
                Upgrade
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
