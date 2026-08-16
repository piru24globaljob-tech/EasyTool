import React, { useState } from 'react';
import { Header } from './components/Header';
import { SmartWorkspaceBar } from './components/SmartWorkspaceBar';
import { ToolGrid } from './components/ToolGrid';
import { PrivacyBanner } from './components/PrivacyBanner';
import { Footer } from './components/Footer';
import { ToolRunnerModal } from './components/ToolRunnerModal';
import { PricingModal } from './components/PricingModal';
import { ParticleCanvas4K } from './components/ParticleCanvas4K';
import { WorkspaceFile, UserPlan } from './types';
import { getPDFPageCount } from './lib/pdfUtils';
import { readFileAsDataURL } from './lib/documentUtils';

export default function App() {
  const [userPlan, setUserPlan] = useState<UserPlan>('free');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['merge-pdf', 'ai-pdf-chat', 'compress-pdf', 'sign-pdf']);

  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  // Handle file uploads into Workspace
  const handleAddFiles = async (files: FileList | File[]) => {
    const newFilesList: WorkspaceFile[] = [];

    for (const file of Array.from(files)) {
      let dataUrl: string | undefined;
      let pageCount: number | undefined;

      if (file.type.startsWith('image/')) {
        try {
          dataUrl = await readFileAsDataURL(file);
        } catch (e) {
          console.error(e);
        }
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        try {
          const buffer = await file.arrayBuffer();
          pageCount = await getPDFPageCount(buffer);
        } catch (e) {
          console.error(e);
        }
      }

      newFilesList.push({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl,
        pageCount,
        uploadedAt: Date.now(),
      });
    }

    setWorkspaceFiles((prev) => [...newFilesList, ...prev]);
  };

  const handleSelectFile = (id: string) => {
    setWorkspaceFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (!target) return prev;
      return [target, ...prev.filter((f) => f.id !== id)];
    });
  };

  const handleRemoveFile = (id: string) => {
    setWorkspaceFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAllFiles = () => {
    setWorkspaceFiles([]);
  };

  const handleToggleFavorite = (toolId: string) => {
    setFavorites((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const handleOpenTool = (toolId: string, targetFileId?: string) => {
    if (targetFileId) {
      setWorkspaceFiles((prev) => {
        const found = prev.find((f) => f.id === targetFileId);
        if (!found) return prev;
        return [found, ...prev.filter((f) => f.id !== targetFileId)];
      });
    }
    setActiveWorkflowId(null);
    setActiveToolId(toolId);
  };

  const handleOpenWorkflow = (workflowId: string) => {
    setActiveToolId(null);
    setActiveWorkflowId(workflowId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/90 via-blue-50/40 to-slate-100 text-slate-800 flex flex-col font-sans antialiased relative overflow-x-hidden">
      {/* 4K Interactive Particle Canvas Background */}
      <ParticleCanvas4K />

      {/* 4K Dynamic Ambient Lighting & Depth Orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/15 blur-[140px] rounded-full -mr-48 -mt-48 pointer-events-none animate-float-orb" />
      <div className="fixed bottom-0 left-0 w-[450px] h-[450px] bg-sky-400/20 blur-[130px] rounded-full -ml-32 -mb-32 pointer-events-none animate-float-reverse" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Header Bar */}
      <Header
        userPlan={userPlan}
        setUserPlan={setUserPlan}
        openPricing={() => setIsPricingOpen(true)}
        activeFileCount={workspaceFiles.length}
      />

      {/* Flagship 4K Smart Workspace Component */}
      <SmartWorkspaceBar
        files={workspaceFiles}
        onAddFiles={handleAddFiles}
        onSelectFile={handleSelectFile}
        onRemoveFile={handleRemoveFile}
        onClearAll={handleClearAllFiles}
        onRunTool={handleOpenTool}
        onRunWorkflow={handleOpenWorkflow}
      />

      {/* Main 4K Tool Catalog Grid */}
      <main className="flex-1">
        <ToolGrid
          onSelectTool={handleOpenTool}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>

      {/* Privacy Guarantee Banner */}
      <PrivacyBanner />

      {/* Footer */}
      <Footer />

      {/* Active Interactive Tool Modal */}
      {(activeToolId || activeWorkflowId) && (
        <ToolRunnerModal
          toolId={activeToolId}
          workflowId={activeWorkflowId}
          files={workspaceFiles}
          onAddFiles={handleAddFiles}
          onClose={() => {
            setActiveToolId(null);
            setActiveWorkflowId(null);
          }}
        />
      )}

      {/* Pricing Modal */}
      {isPricingOpen && (
        <PricingModal
          currentPlan={userPlan}
          onSelectPlan={setUserPlan}
          onClose={() => setIsPricingOpen(false)}
        />
      )}
    </div>
  );
}
