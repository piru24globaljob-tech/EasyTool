import React from 'react';
import { Shield, Heart } from 'lucide-react';
import { FileKitLogo } from './FileKitLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-slate-600 text-xs py-10 px-4 sm:px-6 lg:px-8 border-t border-blue-100 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1 Brand */}
        <div>
          <div className="mb-3">
            <FileKitLogo size="sm" showText={true} />
          </div>
          <p className="text-slate-500 text-xs leading-relaxed mb-4">
            The next-generation AI-powered file workspace combining 40+ PDF, Image, Document, Privacy, and Workflow tools.
          </p>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            <Shield className="w-3.5 h-3.5 text-blue-600" /> 100% In-Memory Safe & Shredded
          </span>
        </div>

        {/* Col 2 PDF Tools */}
        <div>
          <h5 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">PDF Tools</h5>
          <ul className="space-y-1.5 text-slate-600">
            <li><a href="#merge-pdf" className="hover:text-blue-600 transition-colors">Merge PDF</a></li>
            <li><a href="#split-pdf" className="hover:text-blue-600 transition-colors">Split PDF</a></li>
            <li><a href="#compress-pdf" className="hover:text-blue-600 transition-colors">Compress PDF</a></li>
            <li><a href="#sign-pdf" className="hover:text-blue-600 transition-colors">Sign PDF</a></li>
            <li><a href="#protect-pdf" className="hover:text-blue-600 transition-colors">Password Protect PDF</a></li>
          </ul>
        </div>

        {/* Col 3 AI Tools */}
        <div>
          <h5 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">AI Tools</h5>
          <ul className="space-y-1.5 text-slate-600">
            <li><a href="#ai-pdf-chat" className="hover:text-blue-600 transition-colors">AI Chat with PDF</a></li>
            <li><a href="#ai-summarizer" className="hover:text-blue-600 transition-colors">AI Document Summarizer</a></li>
            <li><a href="#ai-table-extractor" className="hover:text-blue-600 transition-colors">AI Table Extractor</a></li>
            <li><a href="#ai-ocr" className="hover:text-blue-600 transition-colors">Vision OCR Reader</a></li>
            <li><a href="#ai-resume-analyzer" className="hover:text-blue-600 transition-colors">AI Resume Analyzer</a></li>
          </ul>
        </div>

        {/* Col 4 Workflows */}
        <div>
          <h5 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">1-Click Workflows</h5>
          <ul className="space-y-1.5 text-slate-600">
            <li><span className="hover:text-blue-600 cursor-pointer">Job Application Optimizer</span></li>
            <li><span className="hover:text-blue-600 cursor-pointer">Invoice & Receipt Sanitizer</span></li>
            <li><span className="hover:text-blue-600 cursor-pointer">Academic Digest & MCQs</span></li>
            <li><span className="hover:text-blue-600 cursor-pointer">Sign & Secure Document</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
        <p>© 2026 ToolKit AI. All rights reserved. Built with Google AI Studio & Gemini 3.6 Flash.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for fast, secure file productivity.
        </p>
      </div>
    </footer>
  );
};
