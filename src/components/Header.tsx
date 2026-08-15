import React, { useState, useRef } from 'react';
import { Search, Shield, Crown, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { UserPlan } from '../types';
import { FileKitLogo } from './FileKitLogo';

interface HeaderProps {
  userPlan: UserPlan;
  setUserPlan: (plan: UserPlan) => void;
  openPricing: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFileCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  userPlan,
  openPricing,
  searchQuery,
  setSearchQuery,
  activeFileCount,
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const catalogElement = document.getElementById('tool-catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <FileKitLogo size="md" showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight font-display">
                FILEKIT <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Shield className="w-3 h-3 text-blue-600" /> 100% In-Memory Privacy
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              All Your File Tools. One Workspace.
            </p>
          </div>
        </div>

        {/* Universal Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-lg relative hidden md:flex items-center"
        >
          <div className="relative w-full flex items-center">
            <Search className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 40+ tools (e.g. Remove Watermark, Compress, Merge, AI Chat)..."
              className="w-full pl-10 pr-24 py-2 bg-blue-50/50 hover:bg-blue-50/80 focus:bg-white text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-blue-200 focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {/* Dedicated Search Action Button */}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200 transition-all"
            title="Toggle Search"
          >
            {isMobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {activeFileCount > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{activeFileCount} file(s) in Workspace</span>
            </div>
          )}

          {/* Plan Pill */}
          <button
            onClick={openPricing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-2xs ${
              userPlan === 'pro'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
                : userPlan === 'business'
                ? 'bg-slate-900 text-white'
                : 'bg-white hover:bg-blue-50 text-slate-700 border border-blue-150'
            }`}
          >
            <Crown className={`w-3.5 h-3.5 ${userPlan === 'free' ? 'text-amber-500' : 'text-amber-300'}`} />
            <span className="capitalize">{userPlan} Plan</span>
            {userPlan === 'free' && (
              <span className="ml-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                Upgrade
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 py-3 bg-blue-50/90 border-t border-blue-100 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. Remove Watermark)..."
                className="w-full pl-9 pr-8 py-2 bg-white text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-blue-200 focus:border-blue-500 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 shrink-0"
            >
              <Search className="w-3.5 h-3.5" /> Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
