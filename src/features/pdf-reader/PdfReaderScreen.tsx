/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Highlighter, 
  FileText, 
  Settings2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  BookOpen, 
  ScrollText, 
  Check, 
  Plus, 
  Search,
  Sun,
  Moon,
  Crop,
  Download,
  List
} from 'lucide-react';
import { usePdfReader } from './usePdfReader';
import { usePdfSearch } from './usePdfSearch';
import { usePdfOutline } from './usePdfOutline';
import { PdfReaderEngine } from './PdfReaderEngine';
import { ReadingNoteDialog } from '../../components/molecules/ReadingNoteDialog';
import { ReadingNoteSearchDialog } from '../../components/molecules/ReadingNoteSearchDialog';
import { PdfIndexingStatusBadge } from '../../components/atoms/PdfIndexingStatusBadge';
import { PdfSearchDialog } from '../../components/molecules/PdfSearchDialog';
import { PdfTocSidebar } from '../../components/molecules/PdfTocSidebar';
import { ExportDocumentModal } from '../../components/molecules/ExportDocumentModal';
import { useTheme, READING_MODES, PdfReadingMode } from '../../core/theme/ThemeContext';

export interface PdfReaderScreenProps {
  docId: string;
  docTitle: string;
  sourceUrlOrBuffer: string | ArrayBuffer;
  initialPage?: number;
  onClose: () => void;
}

export const PdfReaderScreen: React.FC<PdfReaderScreenProps> = ({
  docId,
  docTitle,
  sourceUrlOrBuffer,
  initialPage,
  onClose,
}) => {
  const {
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
  } = usePdfReader({
    docId,
    sourceUrlOrBuffer,
    initialPage,
    onClose,
  });

  const { themeType, toggleTheme, pdfReadingMode, setPdfReadingMode } = useTheme();

  // Sidebar visibility state
  const [isNotePanelVisible, setIsNotePanelVisible] = useState<boolean>(false);

  // Sync dialog visibility with panel visibility
  useEffect(() => {
    if (showNoteDialog || showSearchNoteDialog) {
      setIsNotePanelVisible(true);
    }
  }, [showNoteDialog, showSearchNoteDialog]);

  // TOC (Outline) Engine
  const { outline } = usePdfOutline(pdfDoc);
  const [showToc, setShowToc] = useState<boolean>(false);

  // PDF Search Engine
  const {
    isSearchOpen,
    setIsSearchOpen,
    toggleSearch,
    searchResults,
    isSearching,
    activeMatchIndex,
    setActiveMatchIndex,
    handleSearch,
  } = usePdfSearch(docId, pdfDoc);

  // Export Notes Modal State
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Permanent Side Panel Mode: 'list' (search & view notes) or 'edit' (create / edit note)
  const [notePanelMode, setNotePanelMode] = useState<'list' | 'edit'>('list');

  // Sync with editingNote if set externally
  useEffect(() => {
    if (editingNote) {
      setNotePanelMode('edit');
    }
  }, [editingNote]);

  // Jump to specific page
  const handleJumpToPage = (pageNum: number) => {
    const pageElem = document.getElementById(`pdf-page-container-${pageNum}`);
    if (pageElem) {
      pageElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Keyboard shortcut (Ctrl/Cmd + F for PDF Search, Ctrl/Cmd + O for TOC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch]);

  return (
    <div
      id="passio-pdf-fullscreen-reader"
      className="fixed inset-0 z-50 flex flex-col w-screen h-screen select-none overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Top Header Bar - Minimal Controls */}
      <header 
        className="h-14 px-6 flex items-center justify-between border-b z-40 relative backdrop-blur-md transition-all duration-300 shrink-0 opacity-0 hover:opacity-100"
        style={{
          borderColor: 'var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
        }}
      >
        {/* Header Controls (Left: Doc Info + Search + Settings, Right: Notes/Close) */}
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Left Side: Info, Search, Settings */}
          <div className="flex items-center gap-3">
            {/* TOC Sidebar Toggle Button */}
            {outline.length > 0 && (
              <button
                onClick={() => setShowToc((prev) => !prev)}
                className="p-1.5 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 text-stone-600 dark:text-stone-300"
                style={{ borderColor: 'var(--color-border-subtle)' }}
                title="İçindekiler Tablosu"
              >
                <List className="w-4 h-4" />
              </button>
            )}

            <div className="flex flex-col">
              <h1 className="text-xs font-serif font-medium tracking-wide truncate max-w-xs sm:max-w-md">
                {docTitle}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono opacity-50 tracking-wider">
                  {isLoading ? 'Yükleniyor...' : `Sayfa ${currentPage} / ${totalPages}`}
                </span>
                <PdfIndexingStatusBadge docId={docId} />
              </div>
            </div>

            <div className="w-px h-6 bg-stone-300 dark:bg-stone-700 mx-2" />

            <div className="flex items-center gap-2">
              {/* PDF Arama Butonu */}
              <button
                onClick={toggleSearch}
                className="p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center"
                style={{
                  borderColor: isSearchOpen ? 'var(--color-text-accent)' : 'var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                }}
                title="Belgede Ara (Ctrl+F)"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Ayarlar */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings((prev) => !prev)}
                  className="p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center"
                  style={{
                    borderColor: showSettings ? 'var(--color-text-accent)' : 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                  }}
                  title="Okuyucu Ayarları"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                {/* Settings Panel */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 w-72 p-4 rounded-xl border shadow-2xl flex flex-col gap-4 font-mono text-xs z-50"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        borderColor: 'var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                        boxShadow: 'var(--shadows-large)',
                      }}
                    >
                      {/* ... Settings Content ... */}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Side: Notes, Close */}
          <div className="flex items-center gap-2">
            {/* Not Paneli Toggle */}
            <button
              onClick={() => {
                if (isNotePanelVisible && showNoteDialog) {
                  setIsNotePanelVisible(false);
                  setShowNoteDialog(false);
                } else {
                  setIsNotePanelVisible(true);
                  setShowNoteDialog(true);
                  setShowSearchNoteDialog(false);
                  handleOpenNewNote();
                }
              }}
              className="p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center"
              style={{
                borderColor: (isNotePanelVisible && showNoteDialog) ? 'var(--color-text-accent)' : 'var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
              title="Not Ekle"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Not Arama Butonu */}
            <button
              onClick={() => {
                if (isNotePanelVisible && showSearchNoteDialog) {
                  setIsNotePanelVisible(false);
                  setShowSearchNoteDialog(false);
                } else {
                  setIsNotePanelVisible(true);
                  setShowSearchNoteDialog(true);
                  setShowNoteDialog(false);
                  handleOpenSearchNote();
                }
              }}
              className="p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center"
              style={{
                borderColor: (isNotePanelVisible && showSearchNoteDialog) ? 'var(--color-text-accent)' : 'var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
              title="Not Ara"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Kapat */}
            <button
              onClick={onClose}
              className="p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center"
              style={{
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
              title="Kapat (Esc)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Center PDF View Engine Area & Optional Side Panel */}
      <div 
        className={`flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden grid ${
          isNotePanelVisible ? 'grid-cols-1 lg:grid-cols-[80%_20%]' : 'grid-cols-1'
        }`}
      >
        <main className="h-full w-full relative overflow-hidden min-w-0">
          {isLoading ? (
            /* Premium Calm Skeleton Loading View */
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-neutral-400" />
              <span className="text-xs font-mono tracking-widest uppercase opacity-50">
                PDF Okuma Motoru Hazırlanıyor...
              </span>
            </div>
          ) : pdfDoc ? (
            <PdfReaderEngine
              docId={docId}
              pdfDoc={pdfDoc}
              scale={scale}
              fitWidth={fitWidth}
              autoCropMargins={autoCropMargins}
              viewMode={viewMode}
              initialPage={lastReadPage}
              onPageChange={handlePageChange}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-red-500 font-mono text-xs">
              <span>Belge yüklenirken bir hata oluştu.</span>
            </div>
          )}
        </main>

        {/* Optional Notes Side Panel */}
        {isNotePanelVisible && (
          <aside
            className="h-full w-full border-l shrink-0 z-50 shadow-sm overflow-hidden flex flex-col fixed inset-0 bg-[var(--color-bg-surface)] lg:static lg:shadow-none lg:border-l"
            style={{
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'var(--color-bg-surface)',
            }}
          >
            {/* Mobile close button */}
            <div className="lg:hidden p-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button onClick={() => setIsNotePanelVisible(false)} className="p-2 rounded hover:bg-black/5 dark:hover:bg-white/5">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            {showNoteDialog && (
              <ReadingNoteDialog
                note={editingNote}
                onSave={async (title, content, tags, existingId) => {
                  await handleSaveNote(title, content, tags, existingId);
                  setShowNoteDialog(false);
                }}
                onClose={() => {
                  setShowNoteDialog(false);
                }}
              />
            )}
            {showSearchNoteDialog && (
              <ReadingNoteSearchDialog
                notes={notes}
                onSelectNote={(note) => {
                  handleSelectNoteFromSearch(note);
                  setShowSearchNoteDialog(false);
                  setShowNoteDialog(true);
                }}
                onDeleteNote={handleDeleteNote}
                onNewNote={() => {
                  handleOpenNewNote();
                  setShowSearchNoteDialog(false);
                  setShowNoteDialog(true);
                }}
                onClose={() => setShowSearchNoteDialog(false)}
              />
            )}
          </aside>
        )}
      </div>
      
      {/* PDF Table of Contents (İçindekiler) Drawer */}
      <PdfTocSidebar
        isOpen={showToc}
        onClose={() => setShowToc(false)}
        outline={outline}
        onSelectPage={(pageNum) => {
          handleJumpToPage(pageNum);
          setShowToc(false);
        }}
      />

      {/* PDF Search Modal Dialog */}
      <PdfSearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
        results={searchResults}
        isSearching={isSearching}
        activeMatchIndex={activeMatchIndex}
        onSelectMatch={(index) => {
          setActiveMatchIndex(index);
          if (searchResults[index]) {
            handleJumpToPage(searchResults[index].pageNumber);
          }
        }}
        onJumpToPage={handleJumpToPage}
      />

      {/* Export Document Modal */}
      <ExportDocumentModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        documentTitle={docTitle}
        docId={docId}
        notes={notes}
      />
    </div>
  );
};

export default PdfReaderScreen;
