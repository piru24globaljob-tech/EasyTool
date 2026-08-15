import React, { useState } from 'react';
import { Header } from './components/Header';
import { SmartWorkspaceBar } from './components/SmartWorkspaceBar';
import { ToolGrid } from './components/ToolGrid';
import { PrivacyBanner } from './components/PrivacyBanner';
import { Footer } from './components/Footer';
import { ToolRunnerModal } from './components/ToolRunnerModal';
import { PricingModal } from './components/PricingModal';
import { WorkspaceFile, UserPlan } from './types';
import { getPDFPageCount } from './lib/pdfUtils';
import { readFileAsDataURL } from './lib/documentUtils';

export default function App() {
  const [userPlan, setUserPlan] = useState<UserPlan>('free');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50/70 via-white to-blue-50/50 text-slate-800 flex flex-col font-sans antialiased relative overflow-x-hidden">
      {/* Blue & White Ambient Lighting Effects */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-blue-400/15 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-sky-300/20 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

      {/* Header Bar */}
      <Header
        userPlan={userPlan}
        setUserPlan={setUserPlan}
        openPricing={() => setIsPricingOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFileCount={workspaceFiles.length}
      />

      {/* Flagship Smart Workspace Component */}
      <SmartWorkspaceBar
        files={workspaceFiles}
        onAddFiles={handleAddFiles}
        onSelectFile={handleSelectFile}
        onRemoveFile={handleRemoveFile}
        onClearAll={handleClearAllFiles}
        onRunTool={handleOpenTool}
        onRunWorkflow={handleOpenWorkflow}
      />

      {/* Main Tool Catalog Grid */}
      <main className="flex-1">
        <ToolGrid
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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
