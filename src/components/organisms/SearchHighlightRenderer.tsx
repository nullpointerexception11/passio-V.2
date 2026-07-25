import React from 'react';
import { SearchResultMatch } from '../../core/pdf/PdfSearchService';

interface SearchHighlightRendererProps {
  pageNumber: number;
  matches: SearchResultMatch[];
  activeMatchIndex: number;
}

export const SearchHighlightRenderer: React.FC<SearchHighlightRendererProps> = ({
  pageNumber,
  matches,
  activeMatchIndex,
}) => {
  const pageMatches = matches.filter((m) => m.pageNumber === pageNumber);

  if (pageMatches.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {pageMatches.map((match) => {
        const isActive = matches[activeMatchIndex] === match;
        if (!match.boundingRects) return null;

        return match.boundingRects.map((rect, rIdx) => (
          <div
            key={`${match.matchIndex}-${rIdx}`}
            style={{
              left: `${rect.x}px`,
              top: `${rect.y}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
            }}
            className={`absolute transition-all rounded-xs ${
              isActive
                ? 'bg-amber-400/60 dark:bg-amber-500/70 ring-2 ring-amber-500'
                : 'bg-yellow-300/40 dark:bg-yellow-400/30'
            }`}
          />
        ));
      })}
    </div>
  );
};
