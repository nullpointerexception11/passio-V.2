/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { IPdfSearchMatch } from '../../core/pdf/PdfSearchService';
import { HighlightEngine } from '../../core/highlight/HighlightEngine';

interface SearchHighlightRendererProps {
  matches: IPdfSearchMatch[];
  currentMatchId?: string | null;
  pageWidth: number;
  pageHeight: number;
}

export const SearchHighlightRenderer: React.FC<SearchHighlightRendererProps> = React.memo(({
  matches,
  currentMatchId,
  pageWidth,
  pageHeight,
}) => {
  if (!matches || matches.length === 0 || pageWidth <= 0 || pageHeight <= 0) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
      style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}
    >
      {matches.map((match) => {
        const isActive = match.id === currentMatchId;

        return (
          <React.Fragment key={match.id}>
            {match.rects.map((rect, idx) => {
              const bounds = HighlightEngine.denormalizeRect(rect, pageWidth, pageHeight);

              return (
                <div
                  key={`${match.id}-rect-${idx}`}
                  className={`absolute rounded-[2px] transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-400/75 dark:bg-amber-400/85 ring-2 ring-amber-600 dark:ring-amber-300 shadow-lg scale-[1.02] z-30 animate-pulse'
                      : 'bg-yellow-300/45 dark:bg-yellow-400/35 border-b border-yellow-500/50'
                  }`}
                  style={{
                    left: `${bounds.left}px`,
                    top: `${bounds.top}px`,
                    width: `${Math.max(4, bounds.width)}px`,
                    height: `${Math.max(12, bounds.height)}px`,
                    mixBlendMode: 'multiply',
                  }}
                  title={`Arama Eşleşmesi: "${match.matchedText}"`}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
});

export default SearchHighlightRenderer;
