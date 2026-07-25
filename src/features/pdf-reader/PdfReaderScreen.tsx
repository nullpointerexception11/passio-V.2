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
        className="h-14 px-6 flex items-center justify-between border-b z-40 relative backdrop-blur-md transition-colors shrink-0"
        style={{
          borderColor: 'var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
        }}
      >
        {/* Left: Document Information & Page Count */}
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
        </div>

        {/* Top Right: Header Controls */}
        <div className="flex items-center gap-2 relative">
          {/* PDF Arama Butonu */}
          <button
            onClick={toggleSearch}
            className="p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center gap-1.5"
            style={{
              borderColor: isSearchOpen ? 'var(--color-text-accent)' : 'var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
            title="Belgede Ara (Ctrl+F)"
          >
            <Search className="w-4 h-4 text-stone-600 dark:text-stone-300" />
            <span className="text-xs font-mono font-medium hidden md:inline">Ara</span>
          </button>

          {/* Dışa Aktar Butonu */}
          <button
            onClick={() => setShowExportModal(true)}
            className="p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center gap-1.5"
            style={{
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
            title="Notları Dışa Aktar"
          >
            <Download className="w-4 h-4 text-stone-600 dark:text-stone-300" />
            <span className="text-xs font-mono font-medium hidden md:inline">Dışa Aktar</span>
          </button>

          {/* Ayarlar (Sabit Üst Bar Butonu) */}
          <div className="relative">
            <button
              onClick={() => setShowSettings((prev) => !prev)}
              className="p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center gap-1.5"
              style={{
                borderColor: showSettings ? 'var(--color-text-accent)' : 'var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
              title="Okuyucu Ayarları"
            >
              <Settings2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-mono font-medium hidden sm:inline">Ayarlar</span>
            </button>

            {/* Settings Popover Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 p-4 rounded-xl border shadow-2xl flex flex-col gap-4 font-mono text-xs z-50"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                    boxShadow: 'var(--shadows-large)',
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <span className="font-semibold text-accent uppercase tracking-wider text-[11px]">
                      OKUYUCU AYARLARI
                    </span>
                    <span className="text-[10px] opacity-40">PASSIO PDF</span>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] opacity-60 uppercase">Yakınlaştırma ({Math.round(scale * 100)}%)</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleZoomOut}
                        className="p-2 rounded border flex-1 flex justify-center items-center hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                        style={{ borderColor: 'var(--color-border-subtle)' }}
                        title="Uzaklaştır"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleZoomIn}
                        className="p-2 rounded border flex-1 flex justify-center items-center hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                        style={{ borderColor: 'var(--color-border-subtle)' }}
                        title="Yakınlaştır"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Fit Width & Auto Crop Controls */}
                  <div className="flex flex-col gap-2 border-t pt-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <button
                      onClick={toggleFitWidth}
                      className={`p-2 rounded border flex items-center justify-between transition-colors cursor-pointer ${
                        fitWidth ? 'border-accent text-accent font-semibold' : ''
                      }`}
                      style={{ borderColor: fitWidth ? 'var(--color-text-accent)' : 'var(--color-border-subtle)' }}
                    >
                      <span className="flex items-center gap-2">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Genişliğe Sığdır</span>
                      </span>
                      {fitWidth && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={toggleAutoCropMargins}
                      className={`p-2 rounded border flex items-center justify-between transition-colors cursor-pointer ${
                        autoCropMargins ? 'border-accent text-accent font-semibold bg-amber-500/10' : ''
                      }`}
                      style={{ borderColor: autoCropMargins ? 'var(--color-text-accent)' : 'var(--color-border-subtle)' }}
                      title="PDF sayfasındaki boş kenarlıkları otomatik keser ve metni tam ortalar"
                    >
                      <span className="flex items-center gap-2">
                        <Crop className="w-3.5 h-3.5 text-amber-500" />
                        <span>Metni Ortala & Boşlukları Kırp</span>
                      </span>
                      {autoCropMargins && <Check className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                  </div>

                  {/* View Mode Controls */}
                  <div className="flex flex-col gap-2 border-t pt-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <span className="text-[10px] opacity-60 uppercase">Sayfa Görünümü</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setViewMode('continuous')}
                        className={`p-2 rounded border flex items-center justify-center gap-1.5 cursor-pointer ${
                          viewMode === 'continuous' ? 'border-accent text-accent font-semibold' : ''
                        }`}
                        style={{ borderColor: viewMode === 'continuous' ? 'var(--color-text-accent)' : 'var(--color-border-subtle)' }}
                      >
                        <ScrollText className="w-3.5 h-3.5" />
                        <span>Sürekli</span>
                      </button>
                      <button
                        onClick={() => setViewMode('single')}
                        className={`p-2 rounded border flex items-center justify-center gap-1.5 cursor-pointer ${
                          viewMode === 'single' ? 'border-accent text-accent font-semibold' : ''
                        }`}
                        style={{ borderColor: viewMode === 'single' ? 'var(--color-text-accent)' : 'var(--color-border-subtle)' }}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Tek Sayfa</span>
                      </button>
                    </div>
                  </div>

                  {/* PDF Reading Theme Mode */}
                  <div className="flex flex-col gap-2 border-t pt-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <span className="text-[10px] opacity-60 uppercase">PDF Okuma Modu</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {READING_MODES.map((mode) => {
                        const isSelected = pdfReadingMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setPdfReadingMode(mode.id as PdfReadingMode)}
                            className={`py-1.5 px-1 rounded border text-[11px] font-mono transition-all text-center cursor-pointer truncate ${
                              isSelected ? 'font-semibold border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10' : 'hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                            style={{
                              borderColor: isSelected ? 'var(--color-text-accent)' : 'var(--color-border-subtle)',
                            }}
                            title={mode.description}
                          >
                            {mode.label.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* App Theme Quick Toggle */}
                  <div className="flex flex-col gap-2 border-t pt-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] opacity-60 uppercase">Arayüz Teması</span>
                      <button
                        onClick={toggleTheme}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{ borderColor: 'var(--color-border-subtle)' }}
                      >
                        {themeType === 'light' ? (
                          <>
                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                            <span>Açık</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Koyu</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notlar Menüsü */}
          <div className="relative">
            <button
              onClick={() => setShowNoteMenu((prev) => !prev)}
              className="p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center gap-1"
              style={{
                borderColor: notes.length > 0 ? 'var(--color-text-accent)' : 'var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
              title="Okuma Notları"
            >
              <FileText className="w-4 h-4" />
              {notes.length > 0 && (
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1 rounded-full">
                  {notes.length}
                </span>
              )}
            </button>

            {/* Note Options Popover */}
            <AnimatePresence>
              {showNoteMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-44 p-1.5 rounded-xl border shadow-2xl z-50 flex flex-col gap-1 font-mono text-xs"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                    boxShadow: 'var(--shadows-large)',
                  }}
                >
                  <button
                    onClick={handleOpenNewNote}
                    className="w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-left cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-500" />
                    <span>Yeni Not</span>
                  </button>
                  <button
                    onClick={handleOpenSearchNote}
                    className="w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-left cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 opacity-60" />
                    <span>Not Ara</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowNoteMenu(false);
                      setShowExportModal(true);
                    }}
                    className="w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-left cursor-pointer border-t border-stone-200 dark:border-stone-800 mt-1 pt-2"
                  >
                    <Download className="w-3.5 h-3.5 opacity-60" />
                    <span>Dışa Aktar</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Vurgu */}
          <div
            className="p-2 rounded border border-amber-500/50 bg-amber-500/10 text-amber-500 flex items-center justify-center transition-all cursor-default"
            title="Vurgulama Modu (Metin seçerek vurgulayın)"
          >
            <Highlighter className="w-4 h-4 text-amber-500" />
          </div>

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
      </header>

      {/* Center PDF View Engine Area & Reading Notes Split View */}
      <div className="flex-1 flex w-full h-[calc(100vh-3.5rem)] overflow-hidden relative">
        <main 
          className={`h-full transition-all duration-300 relative overflow-hidden ${
            showNoteDialog || showSearchNoteDialog ? 'w-full lg:w-[80%] flex-1' : 'w-full'
          }`}
        >
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

        {/* 20% Reading Notes Side Panel */}
        <AnimatePresence>
          {(showNoteDialog || showSearchNoteDialog) && (
            <motion.aside
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="w-full sm:w-[320px] lg:w-[20%] min-w-[280px] max-w-[380px] h-full border-l shrink-0 z-30 shadow-xl"
              style={{
                borderColor: 'var(--color-border-subtle)',
                backgroundColor: 'var(--color-bg-surface)',
              }}
            >
              {showNoteDialog && (
                <ReadingNoteDialog
                  note={editingNote}
                  onSave={handleSaveNote}
                  onClose={() => {
                    setShowNoteDialog(false);
                  }}
                />
              )}

              {showSearchNoteDialog && (
                <ReadingNoteSearchDialog
                  notes={notes}
                  onSelectNote={handleSelectNoteFromSearch}
                  onDeleteNote={handleDeleteNote}
                  onClose={() => setShowSearchNoteDialog(false)}
                />
              )}
            </motion.aside>
          )}
        </AnimatePresence>
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
