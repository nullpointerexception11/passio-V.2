/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { INotebook } from '../../../core/notebooks/NotebookModel';
import { useWritingEditor } from '../hooks/useWritingEditor';
import { WritingRoomHeader } from './WritingRoomHeader';
import { TipTapEditor } from './TipTapEditor';
import { KnowledgeLeftPanel } from './KnowledgeLeftPanel';
import { DocumentRightPanel } from './DocumentRightPanel';
import { NotebookSettingsModal } from '../../../components/molecules/NotebookSettingsModal';
import { KnowledgeIntegrationService } from '../../../core/knowledge/KnowledgeIntegrationService';
import { IKnowledgeBridgeItem } from '../../../entities/knowledge/KnowledgeBridgeModel';

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
    readingTimeMinutes,
    settings,
    saveStatus,
    references,
    isLeftPanelOpen,
    isRightPanelOpen,
    isSettingsOpen,
    setIsLeftPanelOpen,
    setIsRightPanelOpen,
    setIsSettingsOpen,
    handleContentChange,
    handleInsertKnowledgeItem,
    handleSettingsChange,
  } = useWritingEditor(notebook, onNotebookUpdated);

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
      className="w-screen h-screen flex flex-col select-none overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Header Bar */}
      <WritingRoomHeader
        notebook={notebook}
        saveStatus={saveStatus}
        wordCount={wordCount}
        isLeftPanelOpen={isLeftPanelOpen}
        isRightPanelOpen={isRightPanelOpen}
        onBack={onBack}
        onToggleLeftPanel={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
        onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Bilgi Parçaları */}
        <KnowledgeLeftPanel
          isOpen={isLeftPanelOpen}
          notebookId={notebook.metadata.id}
          onClose={() => setIsLeftPanelOpen(false)}
          onInsertItem={handleInsertKnowledgeItem}
          onNavigateToSource={(item) => handleNavigateToSource(item.materialId, item.pageNumber)}
        />

        {/* Center: TipTap Writing Canvas */}
        <main className="flex-1 h-full overflow-hidden flex justify-center items-center relative">
          <TipTapEditor
            initialContent={contentText}
            settings={settings}
            onChange={handleContentChange}
            onDropKnowledgeItem={handleDropKnowledgeItem}
          />
        </main>

        {/* Right Sidebar: Belge Bilgileri & Kaynaklar */}
        <DocumentRightPanel
          isOpen={isRightPanelOpen}
          notebook={notebook}
          references={references}
          wordCount={wordCount}
          readingTimeMinutes={readingTimeMinutes}
          onClose={() => setIsRightPanelOpen(false)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNavigateToSource={(matId, page) => handleNavigateToSource(matId, page)}
        />
      </div>

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
