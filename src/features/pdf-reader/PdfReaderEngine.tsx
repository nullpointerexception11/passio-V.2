/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { PdfEngine } from '../../core/pdf/PdfService';
import { HighlightService } from '../../core/highlight/HighlightService';
import { PdfPageCanvas } from './PdfPageCanvas';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PdfReaderEngineProps {
  docId: string;
  docTitle: string;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  scale: number;
  fitMode: 'width' | 'page' | 'none';
  autoCropMargins?: boolean;
  viewMode: 'continuous' | 'single';
  onPageChange: (page: number, totalPages: number) => void;
  initialPage?: number;
}

export const PdfReaderEngine: React.FC<PdfReaderEngineProps> = ({
  docId,
  docTitle,
  pdfDoc,
  scale,
  fitMode,
  autoCropMargins = true,
  viewMode,
  onPageChange,
  initialPage = 1,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [computedScale, setComputedScale] = useState<number>(scale);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const numPages = pdfDoc.numPages;

  // Pre-load highlights for this material/document from database
  useEffect(() => {
    HighlightService.loadHighlights(docId);
  }, [docId]);

  // Handle Fit to Width / Fit to Page scale calculation
  useEffect(() => {
    if (fitMode === 'none' || !scrollContainerRef.current) {
      setComputedScale(scale);
      return;
    }

    let isMounted = true;
    pdfDoc.getPage(currentPage).then((page) => {
      if (!isMounted || !scrollContainerRef.current) return;
      const viewport = page.getViewport({ scale: 1.0 });
      const containerWidth = scrollContainerRef.current.clientWidth - 48;
      const containerHeight = scrollContainerRef.current.clientHeight - 48;

      if (fitMode === 'width') {
        const availableWidth = Math.max(scrollContainerRef.current.clientWidth, 200);
        if (availableWidth > 0 && viewport.width > 0) {
          const fitScale = availableWidth / viewport.width;
          setComputedScale(Math.min(Math.max(fitScale, 0.4), 4.0));
        }
      } else if (fitMode === 'page') {
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        const fitScale = Math.min(scaleX, scaleY);
        if (fitScale > 0) {
          setComputedScale(Math.min(Math.max(fitScale, 0.4), 3.0));
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fitMode, scale, pdfDoc, currentPage]);

  // Jump to initial page or restored last read page on mount
  useEffect(() => {
    if (initialPage > 1 && viewMode === 'continuous') {
      const timer = setTimeout(() => {
        if (virtuosoRef.current) {
          virtuosoRef.current.scrollToIndex({
            index: initialPage - 1,
            align: 'start',
            behavior: 'smooth',
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [initialPage, viewMode]);

  // Listen to custom jump events from TOC or search
  useEffect(() => {
    const handleJumpEvent = (e: CustomEvent<{ page: number }>) => {
      const pageNum = e.detail?.page;
      if (pageNum && pageNum >= 1 && pageNum <= numPages) {
        if (viewMode === 'continuous' && virtuosoRef.current) {
          virtuosoRef.current.scrollToIndex({
            index: pageNum - 1,
            align: 'start',
            behavior: 'smooth',
          });
        }
      }
    };
    window.addEventListener('passio:jump-to-page' as any, handleJumpEvent as any);
    return () => {
      window.removeEventListener('passio:jump-to-page' as any, handleJumpEvent as any);
    };
  }, [numPages, viewMode]);

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
      className="w-full h-full overflow-hidden relative flex flex-col items-center justify-start touch-pan-y"
      style={{
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      {viewMode === 'continuous' ? (
        /* Continuous Scroll View Mode using react-virtuoso windowed rendering */
        <Virtuoso
          ref={virtuosoRef}
          totalCount={numPages}
          initialTopMostItemIndex={initialPage > 1 ? initialPage - 1 : 0}
          overscan={40}
          className="w-full h-full custom-scrollbar"
          style={{ height: '100%', width: '100%' }}
          rangeChanged={({ startIndex, endIndex }) => {
            const middleIndex = Math.floor((startIndex + endIndex) / 2);
            const visiblePage = middleIndex + 1;
            if (visiblePage !== currentPage && visiblePage >= 1 && visiblePage <= numPages) {
              persistPageNumber(visiblePage);
            }
          }}
          itemContent={(index) => {
            const pageNum = index + 1;
            return (
              <div key={`pdf-page-wrapper-${pageNum}`} className={`flex justify-center w-full py-4 ${fitMode === 'width' ? 'px-0' : 'px-4'}`}>
                <PdfPageCanvas
                  docId={docId}
                  docTitle={docTitle}
                  pdfDoc={pdfDoc}
                  pageNumber={pageNum}
                  scale={computedScale}
                  autoCropMargins={autoCropMargins}
                  viewMode={viewMode}
                  onVisible={(visiblePage) => {
                    if (visiblePage !== currentPage) {
                      persistPageNumber(visiblePage);
                    }
                  }}
                />
              </div>
            );
          }}
        />
      ) : (
        /* Single Page View Mode */
        <div className="flex flex-col items-center justify-center min-h-full py-6 relative overflow-y-auto w-full h-full custom-scrollbar">
          <PdfPageCanvas
            key={`pdf-single-page-${currentPage}`}
            docId={docId}
            docTitle={docTitle}
            pdfDoc={pdfDoc}
            pageNumber={currentPage}
            scale={computedScale}
            autoCropMargins={autoCropMargins}
            viewMode={viewMode}
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
