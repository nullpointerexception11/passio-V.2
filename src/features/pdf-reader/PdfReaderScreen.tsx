/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
  Crop
} from 'lucide-react';
import { usePdfReader } from './usePdfReader';
import { PdfReaderEngine } from './PdfReaderEngine';
import { ReadingNoteDialog } from '../../components/molecules/ReadingNoteDialog';
import { ReadingNoteSearchDialog } from '../../components/molecules/ReadingNoteSearchDialog';
import { PdfSearchDialog } from '../../components/molecules/PdfSearchDialog';
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
    handleSetScale,
    handleResetZoom,
    setScale,
    toggleFitWidth,
    toggleAutoCropMargins,
    setViewMode,
    handleOpenNewNote,
    handleOpenSearchNote,
    handleSaveNote,
    handleSelectNoteFromSearch,
    handleDeleteNote,
    handlePageChange,
    pdfSearch,
  } = usePdfReader({
    docId,
    sourceUrlOrBuffer,
    initialPage,
    onClose,
  });

  const { themeType, toggleTheme, pdfReadingMode, setPdfReadingMode } = useTheme();

  const [showZoomPresets, setShowZoomPresets] = React.useState(false);

  // Ctrl+F / Cmd+F Keyboard Shortcut Listener for PDF Local Search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        pdfSearch.setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pdfSearch]);

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
          <div className="flex flex-col">
            <h1 className="text-xs font-serif font-medium tracking-wide truncate max-w-xs sm:max-w-md">
              {docTitle}
            </h1>
            <span className="text-[10px] font-mono opacity-50 tracking-wider">
              {isLoading ? 'Yükleniyor...' : `Sayfa ${currentPage} / ${totalPages}`}
            </span>
          </div>
        </div>

        {/* Top Right: Header Controls */}
        <div className="flex items-center gap-2 relative">
          {/* Quick Zoom Bar */}
          <div className="relative flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg border" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Uzaklaştır"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowZoomPresets((prev) => !prev)}
              className="px-2 py-0.5 rounded text-[11px] font-mono font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Yakınlaştırma Oranı Seç"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Yakınlaştır"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Presets Dropdown */}
            <AnimatePresence>
              {showZoomPresets && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-2 right-0 w-36 py-1.5 rounded-lg border shadow-xl z-50 font-mono text-xs flex flex-col backdrop-blur-md"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0].map((presetScale) => (
                    <button
                      key={`zoom-preset-${presetScale}`}
                      onClick={() => {
                        handleSetScale(presetScale);
                        setShowZoomPresets(false);
                      }}
                      className={`px-3 py-1.5 text-left hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center justify-between cursor-pointer ${
                        Math.abs(scale - presetScale) < 0.05 ? 'font-bold text-amber-600 dark:text-amber-400' : ''
                      }`}
                    >
                      <span>{Math.round(presetScale * 100)}%</span>
                      {Math.abs(scale - presetScale) < 0.05 && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                  <div className="border-t my-1" style={{ borderColor: 'var(--color-border-subtle)' }} />
                  <button
                    onClick={() => {
                      toggleFitWidth();
                      setShowZoomPresets(false);
                    }}
                    className="px-3 py-1.5 text-left hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer text-[11px]"
                  >
                    {fitWidth ? '✓ Genişliğe Sığdırıldı' : 'Genişliğe Sığdır'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* PDF Metin Arama Butonu */}
          <button
            onClick={() => pdfSearch.setIsSearchOpen((prev) => !prev)}
            className="p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center gap-1.5"
            style={{
              borderColor: pdfSearch.isSearchOpen ? 'var(--color-text-accent)' : 'var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
            title="PDF İçi Metin Arama (Ctrl+F)"
          >
            <Search className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-mono font-medium hidden sm:inline">Arama</span>
          </button>

          {/* 1. Ayarlar (Sabit Üst Bar Butonu) */}
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

          {/* 2. Not (aktif - Reading Notes Engine) */}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Vurgu */}
          <div
            className="p-2 rounded border border-amber-500/50 bg-amber-500/10 text-amber-500 flex items-center justify-center transition-all cursor-default"
            title="Vurgulama Modu (Metin seçerek vurgulayın)"
          >
            <Highlighter className="w-4 h-4 text-amber-500" />
          </div>

          {/* 3. Kapat */}
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
            /* Premium Calm Loading View with Subtle Spinner & Transition */
            <motion.div
              key="pdf-loading-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex flex-col items-center justify-center h-full gap-5 p-6"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                <div className="absolute w-2 h-2 bg-amber-500/60 rounded-full animate-ping" />
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className="text-xs font-mono tracking-widest uppercase text-amber-600 dark:text-amber-400 font-medium">
                  PDF Belgesi İşleniyor
                </span>
                <span className="text-[11px] font-sans opacity-60 max-w-xs">
                  Metin ve sayfa katmanları hazırlanıyor...
                </span>
              </div>
            </motion.div>
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
              onScaleChange={setScale}
              getMatchesForPage={pdfSearch.getMatchesForPage}
              currentMatchId={pdfSearch.currentMatch?.id}
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

      {/* Floating PDF Metin Arama Dialog / Bar */}
      <PdfSearchDialog
        isOpen={pdfSearch.isSearchOpen}
        onClose={() => pdfSearch.setIsSearchOpen(false)}
        query={pdfSearch.query}
        onQueryChange={pdfSearch.setQuery}
        isSearching={pdfSearch.isSearching}
        matches={pdfSearch.matches}
        currentMatchIndex={pdfSearch.currentMatchIndex}
        onNext={pdfSearch.nextMatch}
        onPrev={pdfSearch.prevMatch}
        onSelectMatch={pdfSearch.jumpToMatch}
        onClear={pdfSearch.clearSearch}
      />
    </div>
  );
};

export default PdfReaderScreen;
