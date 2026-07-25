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

interface ITextSpan {
  id: string;
  str: string;
  left: number;
  top: number;
  fontSize: number;
  width: number;
}

interface IPdfTextItem {
  str: string;
  transform: number[];
  width: number;
}

const textContentCache = new WeakMap<object, any>();

export const PdfTextLayerOverlay: React.FC<PdfTextLayerOverlayProps> = React.memo(({
  pdfDoc,
  pageNumber,
  scale,
  containerWidth,
  containerHeight,
}) => {
  const [spans, setSpans] = useState<ITextSpan[]>([]);

  useEffect(() => {
    let isSubscribed = true;

    async function extractTextContent() {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        
        let textContent = textContentCache.get(page);
        if (!textContent) {
          textContent = await page.getTextContent();
          textContentCache.set(page, textContent);
        }

        if (!isSubscribed) return;

        const spanList: ITextSpan[] = [];

        for (let i = 0; i < textContent.items.length; i++) {
          const item = textContent.items[i] as unknown as IPdfTextItem;
          if (!item.str || item.str.trim().length === 0) continue;

          // Compute transform coordinates using PDF.js matrix helper
          const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
          const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);

          const left = tx[4];
          const top = tx[5] - fontHeight;

          spanList.push({
            id: `text-${pageNumber}-${i}`,
            str: item.str,
            left,
            top,
            fontSize: fontHeight,
            width: item.width * scale,
          });
        }

        setSpans(spanList);
      } catch (err) {
        Logger.error('PdfTextLayerOverlay', `Failed to load text layer for page ${pageNumber}`, err);
      }
    }

    extractTextContent();

    return () => {
      isSubscribed = false;
    };
  }, [pdfDoc, pageNumber, scale]);

  return (
    <div
      className="absolute inset-0 z-10 select-text overflow-hidden leading-none pointer-events-auto"
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
      }}
    >
      {spans.map((span) => (
        <span
          key={span.id}
          className="absolute cursor-text text-transparent selection:bg-amber-300/40 selection:text-transparent"
          style={{
            left: `${span.left}px`,
            top: `${span.top}px`,
            fontSize: `${span.fontSize}px`,
            fontFamily: 'serif',
            whiteSpace: 'pre',
            transformOrigin: '0% 0%',
          }}
        >
          {span.str}
        </span>
      ))}
    </div>
  );
});

export default PdfTextLayerOverlay;
