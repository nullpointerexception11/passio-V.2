/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { INotebook, INotebookSettings } from '../../../core/notebooks/NotebookModel';
import { NotebookService } from '../../../core/notebooks/NotebookService';
import { WritingService } from '../services/writingService';
import { INotebookReference } from '../../knowledge/ReferenceManager';
import { IKnowledgeBridgeItem } from '../../../entities/knowledge/KnowledgeBridgeModel';
import { Logger } from '../../../infrastructure/logger/Logger';

export function useWritingEditor(
  notebook: INotebook,
  onNotebookUpdated: (updated: INotebook) => void
) {
  const [contentText, setContentText] = useState<string>(notebook.content.text);
  const [settings, setSettings] = useState<INotebookSettings>(notebook.settings);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Stats
  const [wordCount, setWordCount] = useState<number>(notebook.metadata.wordCount);
  const [readingTimeMinutes, setReadingTimeMinutes] = useState<number>(1);

  // References
  const [references, setReferences] = useState<INotebookReference[]>([]);

  // UI Panels
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Debounce save timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load of references and stats
  useEffect(() => {
    const refs = WritingService.getNotebookReferences(notebook.metadata.id);
    setReferences(refs);

    const stats = WritingService.calculateTextStats(notebook.content.text);
    setWordCount(stats.wordCount);
    setReadingTimeMinutes(stats.readingTimeMinutes);
  }, [notebook.metadata.id, notebook.content.text]);

  // Handle content change & background auto-save
  const handleContentChange = useCallback(
    (newText: string) => {
      setContentText(newText);
      const stats = WritingService.calculateTextStats(newText);
      setWordCount(stats.wordCount);
      setReadingTimeMinutes(stats.readingTimeMinutes);
      setSaveStatus('saving');

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const updated = await WritingService.autoSaveContent(notebook.metadata.id, newText);
          if (updated) {
            onNotebookUpdated(updated);
          }
          setSaveStatus('saved');
        } catch (err) {
          Logger.error('useWritingEditor', 'Failed to auto-save notebook', err);
          setSaveStatus('error');
        }
      }, 500);
    },
    [notebook.metadata.id, onNotebookUpdated]
  );

  // Insert Knowledge Item as Citation and register Reference
  const handleInsertKnowledgeItem = useCallback(
    (item: IKnowledgeBridgeItem) => {
      const { formattedCitation, reference } = WritingService.insertKnowledgeReference(
        notebook.metadata.id,
        item
      );

      // Append citation to current text
      const newText = contentText
        ? `${contentText}\n\n${formattedCitation}\n\n`
        : `${formattedCitation}\n\n`;

      handleContentChange(newText);

      // Update local references state
      setReferences((prev) => {
        if (prev.some((r) => r.id === reference.id)) return prev;
        return [...prev, reference];
      });
    },
    [notebook.metadata.id, contentText, handleContentChange]
  );

  // Settings update handler
  const handleSettingsChange = useCallback(
    async (newSettingsPartial: Partial<INotebookSettings>) => {
      const updatedSettings = { ...settings, ...newSettingsPartial };
      setSettings(updatedSettings);

      try {
        const updated = await NotebookService.updateSettings(
          notebook.metadata.id,
          newSettingsPartial
        );
        if (updated) {
          onNotebookUpdated(updated);
        }
      } catch (err) {
        Logger.error('useWritingEditor', 'Failed to update settings', err);
      }
    },
    [notebook.metadata.id, settings, onNotebookUpdated]
  );

  return {
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
  };
}
