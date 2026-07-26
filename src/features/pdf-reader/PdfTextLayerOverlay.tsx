/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfEngine } from '../../core/pdf/PdfService';
import { Logger } from '../../core/logger/Logger';

interface PdfTextLayerOverlayProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  containerWidth: number;
  containerHeight: number;
}

export const PdfTextLayerOverlay: React.FC<PdfTextLayerOverlayProps> = React.memo(({
  pdfDoc,
  pageNumber,
  scale,
  containerWidth,
  containerHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [textContent, setTextContent] = useState<any | null>(null);

  // Effect 1: Fetch and memoize text content
  useEffect(() => {
    let isCancelled = false;
    setTextContent(null);

    async function fetchTextContent() {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;
        const content = await PdfEngine.getCachedTextContent(page);
        if (isCancelled) return;
        setTextContent(content);
      } catch (err) {
        if (!isCancelled) {
          Logger.error('PdfTextLayerOverlay', `Failed to fetch TextContent for page ${pageNumber}`, err);
        }
      }
    }

    fetchTextContent();
    return () => { isCancelled = true; };
  }, [pdfDoc, pageNumber]);

  // Effect 2: Render text layer
  useEffect(() => {
    if (!textContent || !textContent.items || !containerRef.current) return;

    let textLayerInstance: pdfjsLib.TextLayer | null = null;
    let isCancelled = false;

    async function renderTextLayer() {
      if (!containerRef.current) return;

      // Clear previous text layer contents
      containerRef.current.innerHTML = '';

      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        if (isCancelled || !containerRef.current) return;

        containerRef.current.style.setProperty('--scale-factor', `${scale}`);
        containerRef.current.style.setProperty('--total-scale-factor', `${scale}`);
        containerRef.current.style.setProperty('--user-unit', '1');

        textLayerInstance = new pdfjsLib.TextLayer({
          textContentSource: textContent!,
          container: containerRef.current,
          viewport,
        });

        await textLayerInstance.render();
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && !isCancelled) {
          Logger.error('PdfTextLayerOverlay', `Failed to render TextLayer for page ${pageNumber}`, err);
        }
      }
    }

    renderTextLayer();

    return () => {
      isCancelled = true;
      if (textLayerInstance) {
        try {
          textLayerInstance.cancel();
        } catch {
          // ignore cancellation errors
        }
      }
    };
  }, [textContent, scale, pdfDoc, pageNumber]);

  return (
    <div
      ref={containerRef}
      data-pdf-text-layer="true"
      className="textLayer absolute inset-0 z-20 select-text overflow-hidden pointer-events-auto"
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        contain: 'layout style paint',
        touchAction: 'pan-y pinch-zoom',
        WebkitUserSelect: 'text',
        userSelect: 'text',
      }}
    />
  );
});

export default PdfTextLayerOverlay;
