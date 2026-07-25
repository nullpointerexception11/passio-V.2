/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfEngine } from '../../core/pdf/PdfService';
import { HighlightService } from '../../core/highlight/HighlightService';
import { PdfPageCanvas } from './PdfPageCanvas';
import { IPdfSearchMatch } from '../../core/pdf/PdfSearchService';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PdfReaderEngineProps {
  docId: string;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  scale: number;
  fitWidth: boolean;
  autoCropMargins?: boolean;
  viewMode: 'continuous' | 'single';
  onPageChange: (page: number, totalPages: number) => void;
  onScaleChange?: (scaleUpdater: number | ((prev: number) => number)) => void;
  initialPage?: number;
  getMatchesForPage?: (pageNumber: number) => IPdfSearchMatch[];
  currentMatchId?: string | null;
}

export const PdfReaderEngine: React.FC<PdfReaderEngineProps> = ({
  docId,
  pdfDoc,
  scale,
  fitWidth,
  autoCropMargins = true,
  viewMode,
  onPageChange,
  onScaleChange,
  initialPage = 1,
  getMatchesForPage,
  currentMatchId,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [computedScale, setComputedScale] = useState<number>(scale);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const numPages = pdfDoc.numPages;

  // Pre-load highlights for this material/document from database
  useEffect(() => {
    HighlightService.loadHighlights(docId);
  }, [docId]);

  // Handle Fit to Width scale calculation
  useEffect(() => {
    if (!fitWidth || !scrollContainerRef.current) {
      setComputedScale(scale);
      return;
    }

    let isMounted = true;
    pdfDoc.getPage(currentPage).then((page) => {
      if (!isMounted || !scrollContainerRef.current) return;
      const viewport = page.getViewport({ scale: 1.0 });
      const containerWidth = scrollContainerRef.current.clientWidth - 80; // 80px padding
      if (containerWidth > 0 && viewport.width > 0) {
        const fitScale = containerWidth / viewport.width;
        setComputedScale(Math.min(Math.max(fitScale, 0.5), 2.5));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fitWidth, scale, pdfDoc, currentPage]);

  // Trackpad pinch-to-zoom & Ctrl+Wheel zoom listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.003;
        if (onScaleChange) {
          onScaleChange((prev) => Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.4), 3.0));
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [onScaleChange]);

  // Touch device 2-finger pinch-to-zoom listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let initialDist: number | null = null;
    let baseScale = scale;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        baseScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDist && initialDist > 0) {
        e.preventDefault();
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const ratio = currentDist / initialDist;
        const targetScale = Math.min(Math.max(Number((baseScale * ratio).toFixed(2)), 0.4), 3.0);
        if (onScaleChange) {
          onScaleChange(targetScale);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialDist = null;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale, onScaleChange]);

  // Jump to initial page or restored last read page on mount
  useEffect(() => {
    if (initialPage > 1 && viewMode === 'continuous') {
      setTimeout(() => {
        const pageElem = document.getElementById(`pdf-page-container-${initialPage}`);
        if (pageElem) {
          pageElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [initialPage, viewMode]);

  // Save current page state with debounce (avoids database thrashing during rapid scroll)
  const persistPageNumber = useCallback(
    (page: number) => {
      setCurrentPage(page);
      onPageChange(page, numPages);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        PdfEngine.saveLastReadPage(docId, page);
      }, 500);
    },
    [docId, numPages, onPageChange]
  );

  // Single page navigation
  const handleNextPage = () => {
    if (currentPage < numPages) {
      persistPageNumber(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      persistPageNumber(currentPage - 1);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      id="passio-pdf-scroll-chassis"
      className="w-full h-full overflow-y-auto overflow-x-auto flex flex-col items-center custom-scrollbar relative px-2 sm:px-4 py-8 touch-pan-y min-w-0"
      style={{
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      {viewMode === 'continuous' ? (
        /* Continuous Scroll View Mode */
        <div className="flex flex-col items-center justify-center w-full mx-auto">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <PdfPageCanvas
              key={`pdf-page-${pageNum}`}
              docId={docId}
              pdfDoc={pdfDoc}
              pageNumber={pageNum}
              scale={computedScale}
              autoCropMargins={autoCropMargins}
              viewMode={viewMode}
              searchMatches={getMatchesForPage ? getMatchesForPage(pageNum) : []}
              currentMatchId={currentMatchId}
              onVisible={(visiblePage) => {
                if (visiblePage !== currentPage) {
                  persistPageNumber(visiblePage);
                }
              }}
            />
          ))}
        </div>
      ) : (
        /* Single Page View Mode */
        <div className="flex flex-col items-center justify-center w-full min-h-full py-6 relative mx-auto">
          <PdfPageCanvas
            key={`pdf-single-page-${currentPage}`}
            docId={docId}
            pdfDoc={pdfDoc}
            pageNumber={currentPage}
            scale={computedScale}
            autoCropMargins={autoCropMargins}
            viewMode={viewMode}
            searchMatches={getMatchesForPage ? getMatchesForPage(currentPage) : []}
            currentMatchId={currentMatchId}
            onVisible={() => {}}
          />

          {/* Floating Next/Prev Page Controls for Single Page Mode */}
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-full border shadow-xl z-40 bg-neutral-900/90 text-white border-neutral-700/50 backdrop-blur-md">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Önceki Sayfa"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono tracking-wider">
              {currentPage} / {numPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Sonraki Sayfa"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfReaderEngine;
