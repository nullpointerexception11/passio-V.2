/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
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

  useEffect(() => {
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
        const textContent = await page.getTextContent();
        if (isCancelled || !containerRef.current) return;

        containerRef.current.style.setProperty('--scale-factor', `${scale}`);

        textLayerInstance = new pdfjsLib.TextLayer({
          textContentSource: textContent,
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
  }, [pdfDoc, pageNumber, scale]);

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
