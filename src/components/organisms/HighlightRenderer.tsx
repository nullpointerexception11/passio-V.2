/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { IHighlightFragment, HIGHLIGHT_COLOR_MAP } from '../../core/highlight/HighlightModel';
import { HighlightEngine } from '../../core/highlight/HighlightEngine';

interface HighlightRendererProps {
  highlights: IHighlightFragment[];
  pageWidth: number;
  pageHeight: number;
  onHighlightClick?: (highlight: IHighlightFragment, e: React.MouseEvent) => void;
}

export const HighlightRenderer: React.FC<HighlightRendererProps> = React.memo(({
  highlights,
  pageWidth,
  pageHeight,
  onHighlightClick,
}) => {
  if (!highlights || highlights.length === 0 || pageWidth <= 0 || pageHeight <= 0) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
      style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}
    >
      {highlights.map((fragment) => {
        const style = HIGHLIGHT_COLOR_MAP[fragment.color] || HIGHLIGHT_COLOR_MAP.yellow;

        return (
          <React.Fragment key={fragment.id}>
            {fragment.rects.map((rect, idx) => {
              const bounds = HighlightEngine.denormalizeRect(rect, pageWidth, pageHeight);

              return (
                <div
                  key={`${fragment.id}-rect-${idx}`}
                  className="absolute pointer-events-none transition-opacity rounded-[2px]"
                  style={{
                    left: `${bounds.left}px`,
                    top: `${bounds.top}px`,
                    width: `${bounds.width}px`,
                    height: `${bounds.height}px`,
                    backgroundColor: style.bg,
                    borderBottom: `2px solid ${style.border}`,
                    mixBlendMode: 'multiply',
                  }}
                  title={`Knowledge Fragment: "${fragment.selectedText.substring(0, 60)}..."`}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
});

export default HighlightRenderer;
