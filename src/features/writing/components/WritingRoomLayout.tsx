/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minimize2 } from 'lucide-react';
import { INotebook } from '../../../core/notebooks/NotebookModel';
import { useWritingEditor } from '../hooks/useWritingEditor';
import { WritingRoomHeader } from './WritingRoomHeader';
import { TipTapEditor } from './TipTapEditor';
import { KnowledgeLeftPanel } from './KnowledgeLeftPanel';
import { DocumentRightPanel } from './DocumentRightPanel';
import { QuickNoteModal } from './QuickNoteModal';
import { NotebookSettingsModal } from '../../../components/molecules/NotebookSettingsModal';
import { KnowledgeIntegrationService } from '../../../core/knowledge/KnowledgeIntegrationService';
import { IKnowledgeBridgeItem } from '../../../entities/knowledge/KnowledgeBridgeModel';

import { WritingTimeService } from '../../../core/time/WritingTimeService';

interface WritingRoomLayoutProps {
  notebook: INotebook;
  onBack: () => void;
  onNotebookUpdated: (updated: INotebook) => void;
}

export const WritingRoomLayout: React.FC<WritingRoomLayoutProps> = ({
  notebook,
  onBack,
  onNotebookUpdated,
}) => {
  const navigate = useNavigate();

  const {
    contentText,
    wordCount,
    characterCount,
    readingTimeMinutes,
    settings,
    saveStatus,
    references,
    isLeftPanelOpen,
    isRightPanelOpen,
    isSettingsOpen,
    isFocusMode,
    isTypewriterMode,
    isQuickNoteOpen,
    setIsLeftPanelOpen,
    setIsRightPanelOpen,
    setIsSettingsOpen,
    setIsFocusMode,
    setIsTypewriterMode,
    setIsQuickNoteOpen,
    handleContentChange,
    handleInsertKnowledgeItem,
    handleRemoveReference,
    handleSettingsChange,
  } = useWritingEditor(notebook, onNotebookUpdated);

  // Track writing time while editing
  useEffect(() => {
    WritingTimeService.startTracking();
    return () => {
      WritingTimeService.stopTracking();
    };
  }, []);

  // Global Keyboard Shortcuts (CTRL + N for Quick Note, Escape for Focus Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut CTRL+N or Cmd+N -> Quick Note
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        e.stopPropagation();
        setIsQuickNoteOpen(true);
        return;
      }

      // Shortcut Escape -> Exit Focus Mode (when Quick Note is closed)
      if (e.key === 'Escape' && isFocusMode && !isQuickNoteOpen) {
        setIsFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, isQuickNoteOpen, setIsFocusMode, setIsQuickNoteOpen]);

  // Navigate to target PDF page in Library reader
  const handleNavigateToSource = (materialIdOrTitle: string, pageNumber: number) => {
    KnowledgeIntegrationService.navigateToSource(navigate, materialIdOrTitle, pageNumber);
  };

  // Drag & drop drop handler for TipTap
  const handleDropKnowledgeItem = (itemJson: string) => {
    try {
      const item: IKnowledgeBridgeItem = JSON.parse(itemJson);
      if (item && item.id) {
        handleInsertKnowledgeItem(item);
      }
    } catch {
      // Invalid JSON dropped
    }
  };

  return (
    <div
      className="w-screen h-screen flex flex-col select-none overflow-hidden relative"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Header Bar - Hidden in Focus Mode */}
      {!isFocusMode && (
        <WritingRoomHeader
          notebook={notebook}
          saveStatus={saveStatus}
          wordCount={wordCount}
          characterCount={characterCount}
          readingTimeMinutes={readingTimeMinutes}
          isLeftPanelOpen={isLeftPanelOpen}
          isRightPanelOpen={isRightPanelOpen}
          isFocusMode={isFocusMode}
          isTypewriterMode={isTypewriterMode}
          onBack={onBack}
          onToggleLeftPanel={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
          onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
          onToggleTypewriterMode={() => setIsTypewriterMode(!isTypewriterMode)}
          onOpenQuickNote={() => setIsQuickNoteOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Focus Mode Floating Overlay Control (Top-Right Exit Pill) */}
      {isFocusMode && (
        <div className="fixed top-4 right-6 z-50 flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md flex items-center gap-2 text-[11px] font-mono opacity-80 bg-[var(--color-bg-surface)]"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <span>{wordCount} Kelime</span>
            <span>•</span>
            <span>{characterCount} Karakter</span>
            <span>•</span>
            <span>{readingTimeMinutes} dk</span>
          </div>

          <button
            onClick={() => setIsFocusMode(false)}
            className="p-2 rounded-full border shadow-lg backdrop-blur-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all text-amber-500 bg-[var(--color-bg-surface)]"
            style={{ borderColor: 'var(--color-border-subtle)' }}
            title="Odak Modundan Çık (Esc)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Workspace 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Bilgi Parçaları - Hidden in Focus Mode */}
        {!isFocusMode && (
          <KnowledgeLeftPanel
            isOpen={isLeftPanelOpen}
            notebookId={notebook.metadata.id}
            onClose={() => setIsLeftPanelOpen(false)}
            onInsertItem={handleInsertKnowledgeItem}
            onNavigateToSource={(item) => handleNavigateToSource(item.materialId, item.pageNumber)}
          />
        )}

        {/* Center: TipTap Writing Canvas (Occupies 100% full screen in Focus Mode) */}
        <main className="flex-1 h-full overflow-hidden flex justify-center items-center relative">
          <TipTapEditor
            notebookId={notebook.metadata.id}
            initialContent={contentText}
            settings={settings}
            onChange={handleContentChange}
            onDropKnowledgeItem={handleDropKnowledgeItem}
            isTypewriterMode={isTypewriterMode}
          />
        </main>

        {/* Right Sidebar: Belge Bilgileri & Kaynaklar - Hidden in Focus Mode */}
        {!isFocusMode && (
          <DocumentRightPanel
            isOpen={isRightPanelOpen}
            notebook={notebook}
            references={references}
            wordCount={wordCount}
            characterCount={characterCount}
            readingTimeMinutes={readingTimeMinutes}
            onClose={() => setIsRightPanelOpen(false)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onNavigateToSource={(matId, page) => handleNavigateToSource(matId, page)}
            onRemoveReference={handleRemoveReference}
          />
        )}
      </div>

      {/* Quick Note Modal (CTRL + N) */}
      <QuickNoteModal
        isOpen={isQuickNoteOpen}
        onClose={() => setIsQuickNoteOpen(false)}
        notebookId={notebook.metadata.id}
      />

      {/* Settings Modal */}
      <NotebookSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChangeSettings={handleSettingsChange}
      />
    </div>
  );
};
