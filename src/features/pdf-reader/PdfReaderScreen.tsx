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
  BookOpen, 
  ScrollText, 
  Check, 
  Search,
  Crop,
  List,
  Bookmark,
  Clock,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { usePdfReader } from './usePdfReader';
import { usePdfSearch } from './usePdfSearch';
import { usePdfOutline } from './usePdfOutline';
import { PdfReaderEngine } from './PdfReaderEngine';
import { PdfIndexingStatusBadge } from '../../components/atoms/PdfIndexingStatusBadge';
import { PdfSearchDialog } from '../../components/molecules/PdfSearchDialog';
import { PdfTocSidebar } from '../../components/molecules/PdfTocSidebar';
import { ExportDocumentModal } from '../../components/molecules/ExportDocumentModal';
import { useTheme, PdfReadingMode } from '../../core/theme/ThemeContext';
import { BookmarkService } from '../../core/bookmark/BookmarkService';
import { ReadingTimeService, formatReadingDuration, IReadingTimeStats } from '../../core/time/ReadingTimeService';
import { PdfRightSidebar, SidebarTab } from './components/PdfRightSidebar';

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
    fitMode,
    fitWidth,
    autoCropMargins,
    viewMode,
    showSettings,
    setShowSettings,
    notes,
    handleZoomIn,
    handleZoomOut,
    toggleFitWidth,
    toggleFitPage,
    toggleAutoCropMargins,
    setViewMode,
    handlePageChange,
  } = usePdfReader({
    docId,
    sourceUrlOrBuffer,
    initialPage,
    onClose,
  });

  const { pdfReadingMode, setPdfReadingMode } = useTheme();

  // Unified Right Sidebar State (Notes | Highlights | Bookmarks)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(`passio_pdf_sidebar_open_${docId}`);
    return saved === 'true';
  });
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>(() => {
    const saved = localStorage.getItem(`passio_pdf_sidebar_tab_${docId}`);
    return (saved as SidebarTab) || 'notes';
  });

  useEffect(() => {
    localStorage.setItem(`passio_pdf_sidebar_open_${docId}`, String(isSidebarOpen));
  }, [isSidebarOpen, docId]);

  useEffect(() => {
    localStorage.setItem(`passio_pdf_sidebar_tab_${docId}`, sidebarTab);
  }, [sidebarTab, docId]);

  // Bookmarks State
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Distraction Free Mode State
  const [isDistractionFree, setIsDistractionFree] = useState<boolean>(() => {
    return localStorage.getItem('passio_pdf_distraction_free') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('passio_pdf_distraction_free', String(isDistractionFree));
  }, [isDistractionFree]);

  // Reading Time Stats State (Daily and Weekly totals)
  const [readingStats, setReadingStats] = useState<IReadingTimeStats>({
    todaySeconds: 0,
    thisWeekSeconds: 0,
    dailyGoalSeconds: 1800,
  });

  // Track reading session lifecycle
  useEffect(() => {
    ReadingTimeService.startSession(docId, docTitle);
    setReadingStats(ReadingTimeService.getStats());
    const unsub = ReadingTimeService.subscribe((stats) => {
      setReadingStats(stats);
    });
    return () => {
      ReadingTimeService.endSession();
      unsub();
    };
  }, [docId, docTitle]);

  // Monitor bookmark status for active page
  useEffect(() => {
    setIsBookmarked(BookmarkService.isBookmarked(docId, currentPage));
    const unsub = BookmarkService.subscribe(() => {
      setIsBookmarked(BookmarkService.isBookmarked(docId, currentPage));
    });
    return () => unsub();
  }, [docId, currentPage]);

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

  // Keyboard shortcut (F11 for Distraction Free, Ctrl/Cmd + F for PDF Search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        setIsDistractionFree((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (!isDistractionFree) {
          toggleSearch();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch, isDistractionFree]);

  const progressPercent = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <div
      id="passio-pdf-fullscreen-reader"
      className="fixed inset-0 z-50 flex flex-col w-screen h-screen overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Top Header Bar - Minimal Controls */}
      {!isDistractionFree && (
        <header 
        className="h-14 px-6 flex items-center justify-between border-b z-40 relative backdrop-blur-md transition-all duration-300 shrink-0 opacity-0 hover:opacity-100"
        style={{
          borderColor: 'var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
        }}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Left Side: Info, Search, Settings, Reading Time */}
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

            <div className="w-px h-6 bg-stone-300 dark:bg-stone-700 mx-1 hidden sm:block" />

            {/* Subtle Reading Duration Indicator (Daily & Weekly Totals) */}
            <div
              className="hidden md:flex flex-col gap-1 px-2.5 py-1 rounded-lg border bg-black/5 dark:bg-white/5 text-[10px] font-mono opacity-80"
              style={{ borderColor: 'var(--color-border-subtle)' }}
              title="Okuma Oturumu ve Süre Takibi"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Bugün: <strong>{formatReadingDuration(readingStats.todaySeconds)}</strong></span>
                <span className="opacity-30">•</span>
                <span>Bu Hafta: <strong>{formatReadingDuration(readingStats.thisWeekSeconds)}</strong></span>
              </div>
              <div className="w-full h-0.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500/70 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (readingStats.todaySeconds / readingStats.dailyGoalSeconds) * 100)}%` }}
                />
              </div>
            </div>

            <div className="w-px h-6 bg-stone-300 dark:bg-stone-700 mx-1" />

            <div className="flex items-center gap-2">
              {/* Single Click Bookmark Toggle */}
              <button
                onClick={() => BookmarkService.toggleBookmark(docId, currentPage)}
                className={`p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center ${
                  isBookmarked ? 'bg-amber-500/10 border-amber-500 text-amber-500' : ''
                }`}
                style={{ borderColor: isBookmarked ? undefined : 'var(--color-border-subtle)' }}
                title={isBookmarked ? 'Sayfayı Yer İmlerinden Çıkar' : 'Sayfayı Yer İmlerine Ekle'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              </button>

              {/* PDF Search Button */}
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

              {/* Reader Settings */}
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
                      {/* Reading Mode */}
                      <div className="flex flex-col gap-2">
                        <span className="text-stone-400 dark:text-stone-500 uppercase tracking-wider text-[10px] font-semibold">Okuma Modu</span>
                        <div className="grid grid-cols-3 gap-1 bg-stone-100 dark:bg-stone-800/50 p-1 rounded-lg">
                          {(['original', 'dark', 'sepia'] as PdfReadingMode[]).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setPdfReadingMode(mode)}
                              className={`py-1.5 rounded-md text-center transition-all cursor-pointer ${
                                pdfReadingMode === mode
                                  ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100 font-medium'
                                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                              }`}
                            >
                              {mode === 'original' ? 'Orijinal' : mode === 'dark' ? 'Karanlık' : 'Sepya'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Page View Mode */}
                      <div className="flex flex-col gap-2">
                        <span className="text-stone-400 dark:text-stone-500 uppercase tracking-wider text-[10px] font-semibold">Sayfa Akışı</span>
                        <div className="grid grid-cols-2 gap-1 bg-stone-100 dark:bg-stone-800/50 p-1 rounded-lg">
                          {(['continuous', 'single'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setViewMode(mode)}
                              className={`py-1.5 rounded-md text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                viewMode === mode
                                  ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100 font-medium'
                                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                              }`}
                            >
                              {mode === 'continuous' ? (
                                <>
                                  <ScrollText className="w-3 h-3" />
                                  Sürekli
                                </>
                              ) : (
                                <>
                                  <BookOpen className="w-3 h-3" />
                                  Tek Sayfa
                                </>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Zoom Controls */}
                      <div className="flex flex-col gap-2">
                        <span className="text-stone-400 dark:text-stone-500 uppercase tracking-wider text-[10px] font-semibold">Yakınlaştırma</span>
                        <div className="flex items-center justify-between border rounded-lg p-1.5" style={{ borderColor: 'var(--color-border-subtle)' }}>
                          <button
                            onClick={handleZoomOut}
                            disabled={scale <= 0.5}
                            className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 cursor-pointer text-stone-600 dark:text-stone-300"
                            title="Uzaklaştır"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-center min-w-[3rem] font-medium text-stone-700 dark:text-stone-300">
                            %{Math.round(scale * 100)}
                          </span>
                          <button
                            onClick={handleZoomIn}
                            disabled={scale >= 3.0}
                            className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 cursor-pointer text-stone-600 dark:text-stone-300"
                            title="Yakınlaştır"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="flex flex-col gap-2">
                        <span className="text-stone-400 dark:text-stone-500 uppercase tracking-wider text-[10px] font-semibold">Seçenekler</span>
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={toggleFitWidth}
                            className="flex items-center justify-between w-full p-2 rounded-lg border text-left transition-all hover:bg-stone-50 dark:hover:bg-stone-800/30 cursor-pointer"
                            style={{ borderColor: 'var(--color-border-subtle)' }}
                          >
                            <span className="text-stone-700 dark:text-stone-300">Genişliğe Sığdır</span>
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              fitWidth 
                                ? 'bg-amber-500 border-amber-500 text-white' 
                                : 'border-stone-300 dark:border-stone-600'
                            }`}>
                              {fitWidth && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>

                          <button
                            onClick={toggleFitPage}
                            className="flex items-center justify-between w-full p-2 rounded-lg border text-left transition-all hover:bg-stone-50 dark:hover:bg-stone-800/30 cursor-pointer"
                            style={{ borderColor: 'var(--color-border-subtle)' }}
                          >
                            <span className="text-stone-700 dark:text-stone-300">Sayfaya Sığdır</span>
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              fitMode === 'page'
                                ? 'bg-amber-500 border-amber-500 text-white' 
                                : 'border-stone-300 dark:border-stone-600'
                            }`}>
                              {fitMode === 'page' && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>

                          <button
                            onClick={toggleAutoCropMargins}
                            className="flex items-center justify-between w-full p-2 rounded-lg border text-left transition-all hover:bg-stone-50 dark:hover:bg-stone-800/30 cursor-pointer"
                            style={{ borderColor: 'var(--color-border-subtle)' }}
                          >
                            <span className="text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                              <Crop className="w-3.5 h-3.5 opacity-75" />
                              Kenarları Kırp
                            </span>
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              autoCropMargins 
                                ? 'bg-amber-500 border-amber-500 text-white' 
                                : 'border-stone-300 dark:border-stone-600'
                            }`}>
                              {autoCropMargins && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Side: Sidebar Tabs & Close */}
          <div className="flex items-center gap-2">
            {/* Notes Tab Button */}
            <button
              onClick={() => {
                if (isSidebarOpen && sidebarTab === 'notes') {
                  setIsSidebarOpen(false);
                } else {
                  setIsSidebarOpen(true);
                  setSidebarTab('notes');
                }
              }}
              className={`p-2 rounded border transition-all cursor-pointer flex items-center justify-center ${
                isSidebarOpen && sidebarTab === 'notes' ? 'border-amber-500 text-amber-500 bg-amber-500/10' : ''
              }`}
              style={{ borderColor: (isSidebarOpen && sidebarTab === 'notes') ? undefined : 'var(--color-border-subtle)' }}
              title="Notlar"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Highlights Tab Button */}
            <button
              onClick={() => {
                if (isSidebarOpen && sidebarTab === 'highlights') {
                  setIsSidebarOpen(false);
                } else {
                  setIsSidebarOpen(true);
                  setSidebarTab('highlights');
                }
              }}
              className={`p-2 rounded border transition-all cursor-pointer flex items-center justify-center ${
                isSidebarOpen && sidebarTab === 'highlights' ? 'border-amber-500 text-amber-500 bg-amber-500/10' : ''
              }`}
              style={{ borderColor: (isSidebarOpen && sidebarTab === 'highlights') ? undefined : 'var(--color-border-subtle)' }}
              title="Alıntılar"
            >
              <Highlighter className="w-4 h-4" />
            </button>

            {/* Bookmarks Tab Button */}
            <button
              onClick={() => {
                if (isSidebarOpen && sidebarTab === 'bookmarks') {
                  setIsSidebarOpen(false);
                } else {
                  setIsSidebarOpen(true);
                  setSidebarTab('bookmarks');
                }
              }}
              className={`p-2 rounded border transition-all cursor-pointer flex items-center justify-center ${
                isSidebarOpen && sidebarTab === 'bookmarks' ? 'border-amber-500 text-amber-500 bg-amber-500/10' : ''
              }`}
              style={{ borderColor: (isSidebarOpen && sidebarTab === 'bookmarks') ? undefined : 'var(--color-border-subtle)' }}
              title="Yer İmleri"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>

            <div className="w-px h-6 bg-stone-300 dark:bg-stone-700 mx-1" />

            {/* Distraction Free Mode Toggle */}
            <button
              onClick={() => setIsDistractionFree(true)}
              className="p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center text-stone-600 dark:text-stone-300"
              style={{ borderColor: 'var(--color-border-subtle)' }}
              title="Odaklanma Modu (F11)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-stone-300 dark:bg-stone-700 mx-1" />

            {/* Close Reader */}
            <button
              onClick={onClose}
              className="p-2 rounded border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center"
              style={{ borderColor: 'var(--color-border-subtle)' }}
              title="Kapat (Esc)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      )}

      {/* Center PDF View Engine Area & Right Sidebar */}
      <div 
        className={`flex-1 w-full ${isDistractionFree ? 'h-full' : 'h-[calc(100vh-3.5rem)]'} overflow-hidden flex`}
      >
        <main className="h-full flex-1 relative overflow-hidden min-w-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-neutral-400" />
              <span className="text-xs font-mono tracking-widest uppercase opacity-50">
                PDF Okuma Motoru Hazırlanıyor...
              </span>
            </div>
          ) : pdfDoc ? (
            <PdfReaderEngine
              docId={docId}
              docTitle={docTitle}
              pdfDoc={pdfDoc}
              scale={scale}
              fitMode={fitMode}
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

        {/* Right Sidebar (Notes | Highlights | Bookmarks - No Extra Windows) */}
        {isSidebarOpen && !isDistractionFree && (
          <div className="w-80 sm:w-96 h-full border-l shrink-0 z-40">
            <PdfRightSidebar
              docId={docId}
              currentPage={currentPage}
              activeTab={sidebarTab}
              onChangeTab={setSidebarTab}
              onClose={() => setIsSidebarOpen(false)}
              onJumpToPage={handleJumpToPage}
            />
          </div>
        )}
      </div>

      {/* Reading Progress Bar (Very thin line at bottom) */}
      {!isDistractionFree && (
        <div className="fixed bottom-0 left-0 right-0 z-50 h-0.5 bg-stone-200/40 dark:bg-stone-800/40 pointer-events-none">
          <div
            className="h-full bg-amber-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
      
      {/* PDF Table of Contents (İçindekiler) Drawer */}
      <PdfTocSidebar
        isOpen={showToc && !isDistractionFree}
        onClose={() => setShowToc(false)}
        outline={outline}
        onSelectPage={(pageNum) => {
          handleJumpToPage(pageNum);
          setShowToc(false);
        }}
      />

      {/* PDF Search Modal Dialog */}
      <PdfSearchDialog
        isOpen={isSearchOpen && !isDistractionFree}
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

      {/* Subtle Floating Exit Button for Distraction-Free Mode */}
      {isDistractionFree && (
        <button
          onClick={() => setIsDistractionFree(false)}
          className="fixed top-4 right-4 z-50 p-2 rounded-lg border bg-stone-100/90 dark:bg-stone-900/90 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all cursor-pointer opacity-10 hover:opacity-100 text-stone-600 dark:text-stone-300 shadow-sm"
          style={{ borderColor: 'var(--color-border-subtle)' }}
          title="Odaklanma Modundan Çık (F11)"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default PdfReaderScreen;
