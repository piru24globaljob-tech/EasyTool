import React, { useState } from 'react';
import { X, Check, Zap, Crown, Shield, Sparkles } from 'lucide-react';
import { UserPlan } from '../types';

interface PricingModalProps {
  currentPlan: UserPlan;
  onSelectPlan: (plan: UserPlan) => void;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  currentPlan,
  onSelectPlan,
  onClose,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 border-b border-blue-800 relative text-center text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Unlock Full AI Power & Unlimited Storage
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white mb-2">
            ToolKit AI Workspace Plans
          </h2>
          <p className="text-sm text-blue-200 max-w-md mx-auto">
            Choose the right toolkit for your personal, freelance, or team workflow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white/10 p-1 rounded-xl border border-white/20 mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-white text-blue-900 font-extrabold shadow-xs' : 'text-blue-200 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'yearly' ? 'bg-white text-blue-900 font-extrabold shadow-xs' : 'text-blue-200 hover:text-white'
              }`}
            >
              Yearly (Save 35%)
            </button>
          </div>
        </div>

        {/* 3D Pricing Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/80 perspective-1000">
          {/* FREE PLAN */}
          <div className={`card-3d rounded-2xl border p-6 flex flex-col justify-between transition-all bg-white border-b-4 border-b-slate-200 ${
            currentPlan === 'free' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-slate-900 text-base font-display">Free Plan</span>
                {currentPlan === 'free' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">Current</span>
                )}
              </div>
              <div className="mb-4">
                <span className="text-3xl font-black text-slate-900">₹0</span>
                <span className="text-xs text-slate-500"> / forever</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> 5 Files / Day
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Max 25 MB File Size
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Basic PDF & Image Tools
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> 100% In-Memory Privacy
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectPlan('free');
                onClose();
              }}
              className="btn-3d-white w-full py-2.5 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
            >
              {currentPlan === 'free' ? 'Active Plan' : 'Switch to Free'}
            </button>
          </div>

          {/* PRO PLAN */}
          <div className={`card-3d glass-specular-3d rounded-2xl border p-6 flex flex-col justify-between relative transition-all bg-white border-b-4 border-b-blue-600 shadow-[0_20px_35px_-10px_rgba(37,99,235,0.25)] ${
            currentPlan === 'pro'
              ? 'border-blue-600 ring-2 ring-blue-600/30'
              : 'border-blue-400'
          }`}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-[10px] font-black tracking-wider uppercase shadow-md border-t border-white/60">
              Most Popular
            </span>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-base font-display flex items-center gap-1.5 text-blue-600">
                  <Crown className="w-4 h-4 text-amber-500 drop-shadow-sm" /> Pro Workspace
                </span>
                {currentPlan === 'pro' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded-md">Current</span>
                )}
              </div>
              <div className="mb-4">
                <span className="text-3xl font-black text-slate-900">{billingCycle === 'monthly' ? '₹199' : '₹1,499'}</span>
                <span className="text-xs text-slate-500"> / {billingCycle === 'monthly' ? 'month' : 'year'}</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" /> Unlimited Daily Tools
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" /> Up to 500 MB Files
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" /> Full Gemini AI PDF Chat & Summaries
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" /> AI Vision OCR & Table Extractor
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" /> 1-Click Preset PDF Workflows
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectPlan('pro');
                onClose();
              }}
              className="btn-3d-blue w-full py-2.5 text-white rounded-xl font-extrabold text-xs cursor-pointer uppercase tracking-wider"
            >
              {currentPlan === 'pro' ? 'Active Pro Plan' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* BUSINESS PLAN */}
          <div className={`card-3d rounded-2xl border p-6 flex flex-col justify-between transition-all bg-white border-b-4 border-b-slate-900 ${
            currentPlan === 'business' ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-slate-900 text-base font-display">Business</span>
                {currentPlan === 'business' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-md">Current</span>
                )}
              </div>
              <div className="mb-4">
                <span className="text-3xl font-black text-slate-900">₹499</span>
                <span className="text-xs text-slate-500"> / seat / mo</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Team Shared Workspaces
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Bulk Batch File Processing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Dedicated API Key Integration
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Admin Audit Logs & Controls
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectPlan('business');
                onClose();
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white border-b-2 border-black rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              {currentPlan === 'business' ? 'Active Plan' : 'Select Business'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
