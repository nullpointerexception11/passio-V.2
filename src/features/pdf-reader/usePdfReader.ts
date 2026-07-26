/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfEngine } from '../../core/pdf/PdfService';
import { ReadingNoteService } from '../../core/notes/ReadingNoteService';
import { HighlightService } from '../../core/highlight/HighlightService';
import { IReadingNote } from '../../core/notes/ReadingNoteModel';
import { Logger } from '../../core/logger/Logger';

export interface UsePdfReaderOptions {
  docId: string;
  sourceUrlOrBuffer: string | ArrayBuffer;
  initialPage?: number;
  onClose: () => void;
}

export function usePdfReader({
  docId,
  sourceUrlOrBuffer,
  initialPage,
  onClose,
}: UsePdfReaderOptions) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastReadPage, setLastReadPage] = useState<number>(initialPage || 1);
  const [currentPage, setCurrentPage] = useState<number>(initialPage || 1);
  const [totalPages, setTotalPages] = useState<number>(0);

  // PDF View Settings
  const [scale, setScale] = useState<number>(1.0);
  const [fitWidth, setFitWidth] = useState<boolean>(true);
  const [autoCropMargins, setAutoCropMargins] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'continuous' | 'single'>('continuous');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Notes Engine State
  const [showNoteMenu, setShowNoteMenu] = useState<boolean>(false);
  const [showNoteDialog, setShowNoteDialog] = useState<boolean>(false);
  const [showSearchNoteDialog, setShowSearchNoteDialog] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<IReadingNote | null>(null);
  const [notes, setNotes] = useState<IReadingNote[]>([]);

  // Load PDF Document & Restore Last Read Page
  useEffect(() => {
    let isSubscribed = true;

    async function initPdf() {
      setIsLoading(true);
      try {
        const savedPage = initialPage || (await PdfEngine.getLastReadPage(docId));
        if (isSubscribed) setLastReadPage(savedPage);

        const loadedDoc = await PdfEngine.loadDocument(sourceUrlOrBuffer);
        if (isSubscribed) {
          setPdfDoc(loadedDoc);
          setTotalPages(loadedDoc.numPages);
          setCurrentPage(savedPage);
          setIsLoading(false);
        }
      } catch (err) {
        Logger.error('usePdfReader', 'Failed to initialize PDF Reader.', err);
        if (isSubscribed) setIsLoading(false);
      }
    }

    initPdf();

    return () => {
      isSubscribed = false;
      PdfEngine.cancelAllRenders();
    };
  }, [docId, sourceUrlOrBuffer, initialPage]);

  // Load and subscribe to Reading Notes & Highlights for current material
  useEffect(() => {
    HighlightService.loadHighlights(docId);

    ReadingNoteService.loadNotes(docId).then((loaded) => {
      setNotes(loaded);
    });

    const unsubscribe = ReadingNoteService.subscribe(() => {
      setNotes(ReadingNoteService.getNotesForMaterial(docId));
    });

    return () => unsubscribe();
  }, [docId]);

  // Keyboard shortcut listener for ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNoteDialog) {
          setShowNoteDialog(false);
        } else if (showSearchNoteDialog) {
          setShowSearchNoteDialog(false);
        } else if (showNoteMenu) {
          setShowNoteMenu(false);
        } else if (showSettings) {
          setShowSettings(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showSettings, showNoteMenu, showNoteDialog, showSearchNoteDialog]);

  const handleZoomIn = useCallback(() => {
    setFitWidth(false);
    setScale((prev) => Math.min(prev + 0.15, 2.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setFitWidth(false);
    setScale((prev) => Math.max(prev - 0.15, 0.5));
  }, []);

  const toggleFitWidth = useCallback(() => {
    setFitWidth((prev) => !prev);
  }, []);

  const toggleAutoCropMargins = useCallback(() => {
    setAutoCropMargins((prev) => !prev);
  }, []);

  const handleOpenNewNote = useCallback(() => {
    setEditingNote(null);
    setShowNoteMenu(false);
    setShowNoteDialog(true);
  }, []);

  const handleOpenSearchNote = useCallback(() => {
    setShowNoteMenu(false);
    setShowSearchNoteDialog(true);
  }, []);

  const handleSaveNote = useCallback(
    async (title: string, content: string, tags: string[], existingId?: string) => {
      await ReadingNoteService.saveNote(docId, title, content, tags, existingId);
      setShowNoteDialog(false);
      setEditingNote(null);
    },
    [docId]
  );

  const handleSelectNoteFromSearch = useCallback((note: IReadingNote) => {
    setShowSearchNoteDialog(false);
    setEditingNote(note);
    setShowNoteDialog(true);
  }, []);

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      await ReadingNoteService.deleteNote(docId, noteId);
    },
    [docId]
  );

  const handlePageChange = useCallback((page: number, total: number) => {
    setCurrentPage(page);
    setTotalPages(total);
  }, []);

  return {
    pdfDoc,
    isLoading,
    lastReadPage,
    currentPage,
    totalPages,
    scale,
    fitWidth,
    autoCropMargins,
    viewMode,
    showSettings,
    setShowSettings,
    showNoteMenu,
    setShowNoteMenu,
    showNoteDialog,
    setShowNoteDialog,
    showSearchNoteDialog,
    setShowSearchNoteDialog,
    editingNote,
    notes,
    handleZoomIn,
    handleZoomOut,
    toggleFitWidth,
    toggleAutoCropMargins,
    setViewMode,
    handleOpenNewNote,
    handleOpenSearchNote,
    handleSaveNote,
    handleSelectNoteFromSearch,
    handleDeleteNote,
    handlePageChange,
  };
}
