import React, { useRef } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Sparkles,
  Zap,
  Minimize2,
  BrainCircuit,
  PenTool,
  ShieldOff,
  Table,
  Globe,
  Lock,
  Plus,
  Briefcase,
  Receipt,
  GraduationCap,
  FileLock2,
  Layers,
  Eraser,
} from 'lucide-react';
import { WorkspaceFile } from '../types';
import { PRESET_WORKFLOWS } from '../data/tools';

interface SmartWorkspaceBarProps {
  files: WorkspaceFile[];
  onAddFiles: (files: FileList | File[]) => void;
  onSelectFile?: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  onRunTool: (toolId: string, fileId?: string) => void;
  onRunWorkflow: (workflowId: string) => void;
}

export const SmartWorkspaceBar: React.FC<SmartWorkspaceBarProps> = ({
  files,
  onAddFiles,
  onSelectFile,
  onRemoveFile,
  onClearAll,
  onRunTool,
  onRunWorkflow,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const activeFile = files[0];

  return (
    <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white border-b border-blue-800/80 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.6)] relative overflow-hidden">
      {/* 4K Isometric Background Mesh Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-grid-3d opacity-35 pointer-events-none" />
      <div className="absolute -top-24 left-1/4 w-80 h-80 bg-blue-500/25 rounded-full blur-[100px] pointer-events-none animate-float-orb" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-indigo-500/25 rounded-full blur-[110px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.8)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {files.length === 0 ? (
          /* 4K Depth Animated Drag & Drop Hero Box */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="group relative rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-b from-blue-950/60 via-slate-950/80 to-slate-950/90 border-2 border-dashed border-sky-400/40 hover:border-sky-300 backdrop-blur-xl transition-all duration-300 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_30px_70px_-10px_rgba(56,189,248,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] overflow-hidden"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.csv"
            />

            {/* 4K Orbiting Holographic Rings & Levitating Pod */}
            <div className="relative inline-flex items-center justify-center mb-6 w-36 h-36 mx-auto">
              {/* Outer 4K Orbit Ring */}
              <div className="absolute inset-0 rounded-full border border-sky-400/30 border-dashed animate-orbit-4k pointer-events-none flex items-center justify-center">
                <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(37,99,235,0.8)]">
                  PDF
                </span>
                <span className="absolute -bottom-2.5 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(147,51,234,0.8)]">
                  AI
                </span>
              </div>

              {/* Inner 4K Counter-Orbit Ring */}
              <div className="absolute inset-3 rounded-full border border-indigo-400/40 animate-counter-orbit-4k pointer-events-none flex items-center justify-center">
                <span className="absolute -left-2.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                  DOC
                </span>
                <span className="absolute -right-2.5 px-2 py-0.5 rounded-full bg-sky-500 text-white text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(14,165,233,0.8)]">
                  IMG
                </span>
              </div>

              {/* 4K Glowing Ambient Core */}
              <div className="absolute inset-4 bg-gradient-to-r from-sky-400 to-indigo-600 rounded-3xl blur-md opacity-50 group-hover:opacity-90 transition-opacity duration-300 animate-pulse" />
              
              {/* Main Levitating Pod */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-sky-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center border-t-2 border-white/80 border-b-4 border-indigo-950 shadow-[0_12px_28px_rgba(37,99,235,0.6)] group-hover:scale-110 transition-transform duration-300 cursor-pointer animate-float-3d"
              >
                <Upload className="w-9 h-9 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-2 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              Smart <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">4K Animated</span> Workspace
            </h2>
            <p className="text-blue-100/90 text-sm sm:text-base max-w-xl mx-auto mb-7 leading-relaxed font-normal">
              <strong className="text-sky-300 font-bold">Upload once, execute multiple tools.</strong> Drag and drop any PDF, document, or image to compress, convert, sign, translate, or chat with AI.
            </p>

            {/* 4K Tactile Starter Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-7">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-3d-blue inline-flex items-center gap-2.5 px-7 py-3.5 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-[0_10px_25px_-5px_rgba(37,99,235,0.6)]"
              >
                <Upload className="w-4 h-4 text-sky-200" />
                <span>Upload PDF / Document</span>
              </button>
            </div>

            {/* 4K Floating Feature Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-semibold text-blue-200">
              <span className="px-3.5 py-1.5 rounded-xl bg-blue-950/90 border border-sky-400/30 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-sky-400 transition-colors">
                📄 PDFs & Multi-page
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-blue-950/90 border border-sky-400/30 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-sky-400 transition-colors">
                🖼️ Images (PNG, JPG, WebP)
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-blue-950/90 border border-sky-400/30 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-sky-400 transition-colors">
                📊 Office Docs (DOCX, XLSX, PPTX)
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-[0_4px_12px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-emerald-400 transition-colors">
                🔒 100% In-Memory Privacy
              </span>
            </div>
          </div>
        ) : (
          /* Active Loaded File Workspace with 3D Depth */
          <div className="space-y-5">
            {/* Header Status & File Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500 shadow-md shadow-sky-500/50" />
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-sky-300 font-display">
                  Active 3D Workspace Files ({files.length})
                </h3>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.csv"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-3d-blue inline-flex items-center gap-1.5 px-3.5 py-1.5 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Files
                </button>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all border border-slate-700/80 shadow-[0_3px_6px_rgba(0,0,0,0.3)] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Workspace
                </button>
              </div>
            </div>

            {/* Active 3D File Chips List */}
            <div className="flex flex-wrap gap-3.5 items-center overflow-x-auto pb-1">
              {files.map((file) => {
                const isActive = file.id === activeFile.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => onSelectFile && onSelectFile(file.id)}
                    className={`flex items-center gap-3 rounded-2xl p-3 text-xs min-w-[250px] max-w-xs transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-b from-blue-800 to-indigo-950 border-2 border-sky-400 text-white shadow-[0_12px_24px_-6px_rgba(56,189,248,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] -translate-y-1'
                        : 'bg-slate-900/80 border border-slate-700/80 text-blue-100 hover:bg-slate-800/80 shadow-[0_6px_12px_rgba(0,0,0,0.3)] hover:-translate-y-0.5'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isActive
                          ? 'bg-sky-500/30 text-sky-200 border-sky-300/50 shadow-md shadow-sky-500/20'
                          : 'bg-blue-500/20 text-sky-300 border-blue-400/30'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-white truncate">{file.name}</p>
                        {isActive && (
                          <span className="px-1.5 py-0.5 bg-sky-500/30 text-sky-300 border border-sky-400/40 rounded text-[9px] font-extrabold uppercase shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-blue-300 mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB •{' '}
                        {file.pageCount ? `${file.pageCount} Pages` : file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFile(file.id);
                      }}
                      className="text-blue-300 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Smart 3D Action Ribbon */}
            <div className="bg-slate-900/80 border border-blue-700/50 rounded-2xl p-5 backdrop-blur-md shadow-[0_15px_30px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-extrabold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-300" /> Instant 3D Actions for Loaded File
                </span>
                <span className="text-[11px] text-blue-200/90 hidden sm:inline">
                  Process <strong className="text-sky-300">{activeFile.name}</strong>
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => onRunTool('ai-pdf-chat', activeFile.id)}
                  className="btn-3d-blue flex items-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  <BrainCircuit className="w-4 h-4 text-amber-300" /> AI Chat with PDF
                </button>

                <button
                  type="button"
                  onClick={() => onRunTool('remove-watermark', activeFile.id)}
                  className="btn-3d-blue flex items-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-bold cursor-pointer !bg-gradient-to-r !from-cyan-600 !to-blue-600 !border-cyan-800"
                >
                  <Eraser className="w-4 h-4 text-cyan-200" /> Remove Watermark
                </button>

                <button
                  type="button"
                  onClick={() => onRunTool('ai-summarizer', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold border border-blue-700/80 shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-300" /> AI Summarize
                </button>

                <button
                  type="button"
                  onClick={() => onRunTool('compress-pdf', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold border border-blue-700/80 shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-emerald-300" /> Compress
                </button>

                <button
                  type="button"
                  onClick={() => onRunTool('sign-pdf', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold border border-blue-700/80 shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5 text-sky-300" /> Digital Sign
                </button>

                <button
                  type="button"
                  onClick={() => onRunTool('privacy-wipe', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold border border-blue-700/80 shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <ShieldOff className="w-3.5 h-3.5 text-emerald-400" /> Erase Metadata
                </button>

                <button
                  type="button"
                  onClick={() => onRunTool('ai-table-extractor', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold border border-blue-700/80 shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Table className="w-3.5 h-3.5 text-amber-300" /> Extract Tables
                </button>

                <button
                  type="button"
                  onClick={() => onRunTool('ai-translate-doc', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold border border-blue-700/80 shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-300" /> Translate
                </button>

                <button
                  type="button"
                  onClick={() => onRunTool('protect-pdf', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold border border-blue-700/80 shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-rose-300" /> Password Protect
                </button>
              </div>

              {/* 1-Click Preset Workflows Section */}
              <div className="mt-5 pt-4 border-t border-blue-800/80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-300" /> 🔥 1-Click PDF Workflows
                  </span>
                  <span className="text-[10px] text-blue-200">Run chained multi-step pipelines automatically</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {PRESET_WORKFLOWS.map((wf) => (
                    <button
                      key={wf.id}
                      type="button"
                      onClick={() => onRunWorkflow(wf.id)}
                      className="p-3 rounded-xl bg-blue-950/90 hover:bg-blue-900 border border-blue-700/70 hover:border-amber-400/80 text-left transition-all duration-200 group shadow-[0_4px_10px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                          {wf.name}
                        </span>
                        <Zap className="w-3 h-3 text-amber-400 opacity-70 group-hover:opacity-100" />
                      </div>
                      <p className="text-[11px] text-blue-200/90 line-clamp-1">{wf.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
