/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfEngine } from '../../core/pdf/PdfService';
import { Logger } from '../../core/logger/Logger';
import { HighlightService } from '../../core/highlight/HighlightService';
import { HighlightEngine, ISelectionResult } from '../../core/highlight/HighlightEngine';
import { IHighlightFragment, HighlightColor } from '../../core/highlight/HighlightModel';
import { HighlightRenderer } from '../../components/organisms/HighlightRenderer';
import { PdfTextLayerOverlay } from './PdfTextLayerOverlay';
import { HighlightToolbar } from '../../components/molecules/HighlightToolbar';
import { useTheme, PdfReadingMode } from '../../core/theme/ThemeContext';
import { AnimatePresence } from 'motion/react';

const getReadingModeStyles = (mode: PdfReadingMode) => {
  switch (mode) {
    case 'dark':
      return {
        containerBg: '#181818',
        canvasFilter: 'invert(0.88) hue-rotate(180deg) contrast(1.05) brightness(0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      };
    case 'sepia':
      return {
        containerBg: '#FAF2DC',
        canvasFilter: 'sepia(0.5) saturate(1.35) hue-rotate(-10deg) contrast(0.92) brightness(0.97)',
        borderColor: 'rgba(180, 150, 80, 0.25)',
      };
    case 'original':
    default:
      return {
        containerBg: '#FFFFFF',
        canvasFilter: 'none',
        borderColor: 'var(--color-border-subtle)',
      };
  }
};

interface PdfPageCanvasProps {
  docId: string;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  autoCropMargins?: boolean;
  viewMode?: 'continuous' | 'single';
  onVisible?: (pageNumber: number) => void;
}

export const PdfPageCanvas: React.FC<PdfPageCanvasProps> = React.memo(({
  docId,
  pdfDoc,
  pageNumber,
  scale,
  autoCropMargins = false,
  viewMode = 'continuous',
  onVisible,
}) => {
  const { pdfReadingMode } = useTheme();
  const modeStyles = getReadingModeStyles(pdfReadingMode);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageBoxRef = useRef<HTMLDivElement>(null);
  const innerWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isRendered, setIsRendered] = useState<boolean>(false);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({ width: 600, height: 848 });
  const [aspectRatio, setAspectRatio] = useState<number>(0.707); // A4 standard initial ratio
  const [pageHighlights, setPageHighlights] = useState<IHighlightFragment[]>([]);

  // Selection & Toolbar State
  const [pendingSelection, setPendingSelection] = useState<ISelectionResult | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<IHighlightFragment | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number; bottomY?: number } | null>(null);

  // Load and subscribe to highlights for this page
  const refreshHighlights = useCallback(() => {
    const list = HighlightService.getHighlightsForPage(docId, pageNumber);
    setPageHighlights(list);
  }, [docId, pageNumber]);

  useEffect(() => {
    refreshHighlights();
    const unsubscribe = HighlightService.subscribe(() => {
      refreshHighlights();
    });
    return () => unsubscribe();
  }, [refreshHighlights]);

  // Document-level selection and highlight click listener
  const processSelection = useCallback((e?: MouseEvent | TouchEvent) => {
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      const targetElement = innerWrapperRef.current || pageBoxRef.current;
      if (!targetElement) return;

      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        // If single click without text selection, check if user clicked an existing highlight
        if (e) {
          const clientX = 'clientX' in e ? e.clientX : e.changedTouches?.[0]?.clientX;
          const clientY = 'clientY' in e ? e.clientY : e.changedTouches?.[0]?.clientY;

          if (clientX !== undefined && clientY !== undefined) {
            const hitFragment = HighlightEngine.findHighlightAtPoint(pageHighlights, targetElement, clientX, clientY);
            if (hitFragment) {
              setSelectedHighlight(hitFragment);
              setPendingSelection(null);

              const pageRect = targetElement.getBoundingClientRect();
              let minRelTop = Infinity;
              let maxRelBottom = -Infinity;
              for (const rect of hitFragment.rects) {
                if (rect.y < minRelTop) minRelTop = rect.y;
                if (rect.y + rect.height > maxRelBottom) maxRelBottom = rect.y + rect.height;
              }
              const absTop = pageRect.top + minRelTop * pageRect.height;
              const absBottom = pageRect.top + maxRelBottom * pageRect.height;

              setToolbarPos({
                x: clientX,
                y: absTop,
                bottomY: absBottom,
              });
              return;
            }
          }
        }

        setSelectedHighlight(null);
        setPendingSelection(null);
        setToolbarPos(null);
        return;
      }

      // Verify if the selection range intersects this page container
      const range = selection.getRangeAt(0);
      const isIntersecting = range.intersectsNode(targetElement);

      if (!isIntersecting) {
        return;
      }

      const result = HighlightEngine.extractNormalizedSelection(selection, targetElement, pageNumber);
      if (result && result.rects.length > 0) {
        setSelectedHighlight(null);
        setPendingSelection(result);
        setToolbarPos({
          x: result.boundingClientX,
          y: result.boundingClientY,
          bottomY: result.boundingClientYBottom,
        });
      }
    });
  }, [pageNumber, pageHighlights]);

  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent | TouchEvent) => {
      processSelection(e);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [processSelection]);

  // IntersectionObserver for Lazy Page Rendering (Performance optimization for 1000+ pages)
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (onVisible) onVisible(pageNumber);
          } else {
            const bounding = entry.boundingClientRect;
            const screenHeight = window.innerHeight;
            if (Math.abs(bounding.top) > screenHeight * 3) {
              setIsVisible(false);
              setIsRendered(false);
            }
          }
        });
      },
      {
        rootMargin: '400px 0px 400px 0px',
        threshold: 0.1,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [pageNumber, onVisible]);

  const [cropInfo, setCropInfo] = useState<{
    cropLeftPx: number;
    cropWidthPx: number;
    originalWidthPx: number;
  } | null>(null);

  // Fetch initial page dimension ratio and auto-detect text content bounding box
  useEffect(() => {
    let isMounted = true;
    pdfDoc.getPage(pageNumber).then(async (page) => {
      if (!isMounted) return;
      const viewport = page.getViewport({ scale: 1.0 });
      setPageDimensions({ width: viewport.width, height: viewport.height });
      setAspectRatio(viewport.width / viewport.height);

      try {
        const textContent = await PdfEngine.getCachedTextContent(page);
        if (textContent && textContent.items && textContent.items.length > 0) {
          let minX = viewport.width;
          let maxX = 0;

          textContent.items.forEach((item: any) => {
            if (item.str && item.str.trim().length > 0 && item.transform) {
              const tx = item.transform[4];
              const ty = item.transform[5];
              const fontH = Math.abs(item.transform[3]) || 12;
              const itemW = item.width || (item.str.length * fontH * 0.5);
              const pt1 = viewport.convertToViewportPoint(tx, ty);
              const pt2 = viewport.convertToViewportPoint(tx + itemW, ty);
              const vx1 = Math.min(pt1[0], pt2[0]);
              const vx2 = Math.max(pt1[0], pt2[0]);

              if (vx1 < minX && vx1 >= 0) minX = vx1;
              if (vx2 > maxX && vx2 <= viewport.width) maxX = vx2;
            }
          });

          if (minX < maxX && (maxX - minX) >= 80) {
            const pad = 24; // comfortable padding around text content
            const cropLeft = Math.max(0, minX - pad);
            const cropRight = Math.max(0, viewport.width - maxX - pad);
            const cropWidth = viewport.width - cropLeft - cropRight;

            // Apply crop if at least 25px total useless margin is saved
            if ((cropLeft + cropRight) > 25 && isMounted) {
              setCropInfo({
                cropLeftPx: cropLeft,
                cropWidthPx: cropWidth,
                originalWidthPx: viewport.width,
              });
            } else if (isMounted) {
              setCropInfo(null);
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    });

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, pageNumber]);

  // Execute Canvas Render when page comes into viewport threshold
  useEffect(() => {
    if (!isVisible) {
      // Release GPU VRAM memory for offscreen pages
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }

      // Cleanup page resources only if previously rendered
      if (isRendered) {
        PdfEngine.cancelPageRender(docId, pageNumber);
        pdfDoc.getPage(pageNumber).then(page => {
          page.cleanup();
        }).catch(err => {
          Logger.warn('PdfPageCanvas', `Failed to cleanup page ${pageNumber}`, err);
        });
        setIsRendered(false);
      }
      return;
    }

    if (!canvasRef.current) return;

    let isSubscribed = true;
    PdfEngine.renderPageToCanvas(pdfDoc, pageNumber, canvasRef.current, scale, docId).then(() => {
      if (isSubscribed) {
        setIsRendered(true);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [pdfDoc, pageNumber, scale, isVisible, isRendered]);

  const handleSelectColor = async (color: HighlightColor, note?: string) => {
    try {
      if (selectedHighlight) {
        await HighlightService.updateHighlight(docId, selectedHighlight.id, { color, note });
        setSelectedHighlight(null);
        setToolbarPos(null);
      } else if (pendingSelection) {
        await HighlightService.createHighlight(
          docId,
          pageNumber,
          pendingSelection.selectedText,
          pendingSelection.rects,
          color,
          note
        );
        window.getSelection()?.removeAllRanges();
        setPendingSelection(null);
        setToolbarPos(null);
      }
    } catch {
      // Error handled in service
    }
  };

  const handleDeleteHighlight = async () => {
    if (!selectedHighlight) return;
    try {
      await HighlightService.deleteHighlight(docId, selectedHighlight.id);
      setSelectedHighlight(null);
      setToolbarPos(null);
    } catch {
      // Error handled in service
    }
  };

  const estimatedWidth = Math.floor(pageDimensions.width * scale);
  const estimatedHeight = Math.floor(estimatedWidth / aspectRatio);

  const isCropping = autoCropMargins && cropInfo !== null;
  const ratio = cropInfo ? estimatedWidth / cropInfo.originalWidthPx : 1;
  const displayCropWidth = isCropping && cropInfo ? Math.round(cropInfo.cropWidthPx * ratio) : estimatedWidth;
  const displayCropLeft = isCropping && cropInfo ? Math.round(cropInfo.cropLeftPx * ratio) : 0;

  return (
    <div
      ref={containerRef}
      id={`pdf-page-container-${pageNumber}`}
      data-page-number={pageNumber}
      className={`relative flex flex-col items-center justify-center w-full max-w-full transition-all duration-300 mx-auto ${
        viewMode === 'continuous' ? 'my-0' : 'my-6'
      }`}
      style={{
        minHeight: `${estimatedHeight}px`,
      }}
    >
      {/* Page Card Box */}
      <div
        ref={pageBoxRef}
        className={`relative max-w-full overflow-hidden transition-all duration-300 mx-auto flex items-center justify-center ${
          viewMode === 'continuous'
            ? `rounded-none shadow-none border-b border-x ${pageNumber === 1 ? 'border-t' : ''}`
            : 'shadow-lg rounded-sm border'
        }`}
        style={{
          width: `${displayCropWidth}px`,
          height: `${estimatedHeight}px`,
          backgroundColor: modeStyles.containerBg,
          borderColor: modeStyles.borderColor,
        }}
      >
        {/* Inner Content Wrapper */}
        <div
          ref={innerWrapperRef}
          className="relative h-full transition-transform duration-300 mx-auto flex items-center justify-center"
          style={{
            width: `${estimatedWidth}px`,
            height: `${estimatedHeight}px`,
            transform: isCropping ? `translateX(-${displayCropLeft}px)` : 'none',
          }}
        >
          {/* Canvas PDF Page Render */}
          <canvas
            ref={canvasRef}
            className={`block mx-auto transition-opacity duration-300 pointer-events-none select-none ${
              isRendered ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              filter: modeStyles.canvasFilter,
              transition: 'filter 0.25s ease-in-out',
            }}
          />

          {/* Text Selection Overlay Layer */}
          {isRendered && (
            <PdfTextLayerOverlay
              pdfDoc={pdfDoc}
              pageNumber={pageNumber}
              scale={scale}
              containerWidth={estimatedWidth}
              containerHeight={estimatedHeight}
            />
          )}

          {/* Highlight Overlays Layer */}
          {isRendered && (
            <HighlightRenderer
              highlights={pageHighlights}
              pageWidth={estimatedWidth}
              pageHeight={estimatedHeight}
              onHighlightClick={(fragment, e) => {
                e.stopPropagation();
                setSelectedHighlight(fragment);
                setPendingSelection(null);

                const targetElement = innerWrapperRef.current || pageBoxRef.current;
                if (targetElement) {
                  const pageRect = targetElement.getBoundingClientRect();
                  let minRelTop = Infinity;
                  let maxRelBottom = -Infinity;
                  for (const rect of fragment.rects) {
                    if (rect.y < minRelTop) minRelTop = rect.y;
                    if (rect.y + rect.height > maxRelBottom) maxRelBottom = rect.y + rect.height;
                  }
                  const absTop = pageRect.top + minRelTop * pageRect.height;
                  const absBottom = pageRect.top + maxRelBottom * pageRect.height;

                  setToolbarPos({
                    x: e.clientX,
                    y: absTop,
                    bottomY: absBottom,
                  });
                } else {
                  setToolbarPos({ x: e.clientX, y: e.clientY });
                }
              }}
            />
          )}

          {/* Skeleton Loader during page initialization */}
          {!isRendered && (
            <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 animate-pulse flex flex-col p-8 gap-4 justify-between">
              <div className="w-1/3 h-4 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="space-y-3">
                <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="w-5/6 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="w-4/6 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
              <div className="w-1/4 h-3 bg-neutral-200 dark:bg-neutral-800 rounded self-center" />
            </div>
          )}
        </div>
      </div>

      {/* Floating Color / Highlight Popover Toolbar */}
      <AnimatePresence>
        {toolbarPos && (pendingSelection || selectedHighlight) && (
          <HighlightToolbar
            position={toolbarPos}
            bottomY={toolbarPos.bottomY}
            selectedText={selectedHighlight ? selectedHighlight.selectedText : pendingSelection?.selectedText}
            selectedColor={selectedHighlight?.color}
            initialNote={selectedHighlight?.note}
            onSelectColor={handleSelectColor}
            onDelete={handleDeleteHighlight}
            onClose={() => {
              setSelectedHighlight(null);
              setPendingSelection(null);
              setToolbarPos(null);
            }}
            isExisting={!!selectedHighlight}
          />
        )}
      </AnimatePresence>

      {/* Subtle Page Number Label (Only in single mode to preserve zero gap in continuous mode) */}
      {viewMode !== 'continuous' && (
        <span className="mt-2 text-[10px] font-mono tracking-widest text-neutral-400 select-none">
          {pageNumber}
        </span>
      )}
    </div>
  );
});

export default PdfPageCanvas;
