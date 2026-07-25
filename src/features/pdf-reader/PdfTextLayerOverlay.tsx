/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Logger } from '../../core/logger/Logger';

interface PdfTextLayerOverlayProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  containerWidth: number;
  containerHeight: number;
}

interface TextSpanItem {
  id: string;
  str: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
}

const pageTextCache = new WeakMap<object, any>();

export const PdfTextLayerOverlay: React.FC<PdfTextLayerOverlayProps> = React.memo(({
  pdfDoc,
  pageNumber,
  scale,
  containerWidth,
  containerHeight,
}) => {
  const [spans, setSpans] = useState<TextSpanItem[]>([]);

  useEffect(() => {
    let isSubscribed = true;

    async function loadTextContent() {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (!isSubscribed) return;

        const viewport = page.getViewport({ scale });

        let textContent = pageTextCache.get(page);
        if (!textContent) {
          textContent = await page.getTextContent();
          pageTextCache.set(page, textContent);
        }

        if (!isSubscribed || !textContent || !textContent.items) return;

        const spanList: TextSpanItem[] = [];

        for (let i = 0; i < textContent.items.length; i++) {
          const item: any = textContent.items[i];
          if (!item.str || item.str.trim().length === 0) continue;

          const tx = item.transform[4];
          const ty = item.transform[5];
          const fontH = Math.abs(item.transform[3]) || 12;
          const fontW = item.width || (item.str.length * fontH * 0.5);

          // convertToViewportPoint converts (x, y) in PDF space to [vx, vy] in viewport pixel space
          const p1 = viewport.convertToViewportPoint(tx, ty);
          const p2 = viewport.convertToViewportPoint(tx + fontW, ty + fontH);

          const left = Math.min(p1[0], p2[0]);
          const top = Math.min(p1[1], p2[1]);
          const width = Math.abs(p1[0] - p2[0]);
          const height = Math.abs(p1[1] - p2[1]);

          if (width > 0 && height > 0) {
            spanList.push({
              id: `span-${pageNumber}-${i}`,
              str: item.str,
              left,
              top,
              width,
              height,
              fontSize: height,
            });
          }
        }

        if (isSubscribed) {
          setSpans(spanList);
        }
      } catch (err) {
        Logger.error('PdfTextLayerOverlay', `Failed to load text layer for page ${pageNumber}`, err);
      }
    }

    loadTextContent();

    return () => {
      isSubscribed = false;
    };
  }, [pdfDoc, pageNumber, scale]);

  return (
    <div
      className="pdf-text-layer absolute inset-0 z-10 select-text overflow-hidden pointer-events-auto leading-none"
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
      }}
    >
      {spans.map((span) => (
        <span
          key={span.id}
          className="absolute cursor-text whitespace-pre select-text text-transparent"
          style={{
            left: `${span.left}px`,
            top: `${span.top}px`,
            width: `${span.width}px`,
            height: `${span.height}px`,
            fontSize: `${span.fontSize}px`,
            lineHeight: `${span.height}px`,
            color: 'transparent',
            fontFamily: 'sans-serif, serif',
            pointerEvents: 'auto',
            display: 'inline-block',
          }}
        >
          {span.str}
        </span>
      ))}
    </div>
  );
});

export default PdfTextLayerOverlay;
