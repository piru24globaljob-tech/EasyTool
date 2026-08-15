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
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white border-b border-blue-800 shadow-xl relative overflow-hidden">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {files.length === 0 ? (
          /* Empty State Drag & Drop Hero Box */
          <div className="border-2 border-dashed border-blue-300/40 hover:border-blue-300/80 rounded-2xl p-8 text-center bg-blue-950/40 backdrop-blur-xs transition-all group shadow-inner">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.csv"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-2xl bg-blue-500/20 group-hover:bg-blue-500/30 text-blue-300 flex items-center justify-center mx-auto mb-4 border border-blue-400/30 group-hover:scale-105 transition-all shadow-md cursor-pointer"
            >
              <Upload className="w-8 h-8 text-sky-300" />
            </div>
            <h2 className="text-xl font-bold font-display text-white mb-2">
              Smart File Workspace
            </h2>
            <p className="text-blue-100 text-sm max-w-lg mx-auto mb-5">
              <strong className="text-sky-300">Upload once, execute multiple tools.</strong> Drop your PDF, document, or image to compress, convert, sign, translate, or chat with AI.
            </p>

            {/* Quick Starter Action Buttons in Empty State */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 border border-blue-400/30 transition-all hover:scale-105"
              >
                <Upload className="w-4 h-4 text-sky-300" />
                <span>Upload PDF / Document</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-blue-200">
              <span className="px-2 py-1 rounded-md bg-blue-950/80 border border-blue-800/80">PDFs</span>
              <span className="px-2 py-1 rounded-md bg-blue-950/80 border border-blue-800/80">Images (PNG/JPG/WebP)</span>
              <span className="px-2 py-1 rounded-md bg-blue-950/80 border border-blue-800/80">Docs (TXT/MD/DOCX)</span>
              <span className="px-2 py-1 rounded-md bg-emerald-950/70 text-emerald-300 border border-emerald-700/60">🔒 In-Memory Privacy</span>
            </div>
          </div>
        ) : (
          /* Active Loaded File Workspace Ribbon */
          <div className="space-y-4">
            {/* Header Status & File Chips */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-300">
                  Active Workspace Files ({files.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.csv"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Files
                </button>
                <button
                  onClick={onClearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-blue-200 rounded-lg text-xs font-semibold transition-all border border-blue-800"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Workspace
                </button>
              </div>
            </div>

            {/* Active File List Bar */}
            <div className="flex flex-wrap gap-3 items-center overflow-x-auto pb-1">
              {files.map((file, idx) => {
                const isActive = file.id === activeFile.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => onSelectFile && onSelectFile(file.id)}
                    className={`flex items-center gap-3 rounded-xl p-2.5 pr-3 text-xs shadow-md min-w-[240px] max-w-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-900 border-2 border-sky-400 text-white shadow-sky-500/20'
                        : 'bg-blue-950/80 border border-blue-700/80 text-blue-100 hover:bg-blue-900/60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        isActive
                          ? 'bg-sky-500/30 text-sky-200 border-sky-300/50'
                          : 'bg-blue-500/20 text-sky-300 border-blue-400/30'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-white truncate">{file.name}</p>
                        {isActive && (
                          <span className="px-1.5 py-0.2 bg-sky-500/30 text-sky-300 border border-sky-400/30 rounded text-[9px] font-bold uppercase shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-blue-300">
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
                      className="text-blue-300 hover:text-red-300 p-1.5 rounded-md hover:bg-blue-900 transition-all cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Smart Action Ribbon — Quick 1-Click Action Buttons for loaded file */}
            <div className="bg-blue-950/60 border border-blue-700/50 rounded-2xl p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-300" /> Instant Actions for Loaded File
                </span>
                <span className="text-[11px] text-blue-200">
                  Select a tool below to process <strong className="text-sky-300">{activeFile.name}</strong>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onRunTool('ai-pdf-chat', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
                >
                  <BrainCircuit className="w-4 h-4 text-amber-300" /> AI Chat with PDF
                </button>

                <button
                  onClick={() => onRunTool('ai-summarizer', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-900/80 hover:bg-blue-800 text-white rounded-xl text-xs font-medium border border-blue-700 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-300" /> AI Summarize
                </button>

                <button
                  onClick={() => onRunTool('remove-watermark', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02]"
                >
                  <Eraser className="w-4 h-4 text-cyan-200" /> Remove Watermark
                </button>

                <button
                  onClick={() => onRunTool('compress-pdf', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-900/80 hover:bg-blue-800 text-white rounded-xl text-xs font-medium border border-blue-700 transition-all"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-emerald-300" /> Compress
                </button>

                <button
                  onClick={() => onRunTool('sign-pdf', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-900/80 hover:bg-blue-800 text-white rounded-xl text-xs font-medium border border-blue-700 transition-all"
                >
                  <PenTool className="w-3.5 h-3.5 text-sky-300" /> Digital Sign
                </button>

                <button
                  onClick={() => onRunTool('privacy-wipe', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-900/80 hover:bg-blue-800 text-white rounded-xl text-xs font-medium border border-blue-700 transition-all"
                >
                  <ShieldOff className="w-3.5 h-3.5 text-emerald-400" /> Erase Metadata
                </button>

                <button
                  onClick={() => onRunTool('ai-table-extractor', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-900/80 hover:bg-blue-800 text-white rounded-xl text-xs font-medium border border-blue-700 transition-all"
                >
                  <Table className="w-3.5 h-3.5 text-amber-300" /> Extract Tables
                </button>

                <button
                  onClick={() => onRunTool('ai-translate-doc', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-900/80 hover:bg-blue-800 text-white rounded-xl text-xs font-medium border border-blue-700 transition-all"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-300" /> Translate
                </button>

                <button
                  onClick={() => onRunTool('protect-pdf', activeFile.id)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-900/80 hover:bg-blue-800 text-white rounded-xl text-xs font-medium border border-blue-700 transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-rose-300" /> Password Protect
                </button>
              </div>

              {/* 1-Click Preset Workflows Section */}
              <div className="mt-4 pt-4 border-t border-blue-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-300" /> 🔥 1-Click PDF Workflows
                  </span>
                  <span className="text-[10px] text-blue-200">Run chained multi-step pipelines automatically</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {PRESET_WORKFLOWS.map((wf) => (
                    <button
                      key={wf.id}
                      onClick={() => onRunWorkflow(wf.id)}
                      className="p-2.5 rounded-xl bg-blue-950/90 hover:bg-blue-900 border border-blue-800 hover:border-amber-400/60 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-white group-hover:text-amber-300 transition-colors">
                          {wf.name}
                        </span>
                        <Zap className="w-3 h-3 text-amber-400 opacity-70 group-hover:opacity-100" />
                      </div>
                      <p className="text-[11px] text-blue-200 line-clamp-1">{wf.description}</p>
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
