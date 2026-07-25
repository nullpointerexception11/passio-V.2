/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MessageSquare } from 'lucide-react';
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
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
      style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}
    >
      {highlights.map((fragment) => {
        const style = HIGHLIGHT_COLOR_MAP[fragment.color] || HIGHLIGHT_COLOR_MAP.yellow;
        const firstRect = fragment.rects[0];
        const firstBounds = firstRect ? HighlightEngine.denormalizeRect(firstRect, pageWidth, pageHeight) : null;

        return (
          <React.Fragment key={fragment.id}>
            {/* Highlight / Underline Rectangles Layer */}
            {fragment.rects.map((rect, idx) => {
              const bounds = HighlightEngine.denormalizeRect(rect, pageWidth, pageHeight);
              const isUnderline = fragment.styleType === 'underline';

              return (
                <div
                  key={`${fragment.id}-rect-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onHighlightClick) onHighlightClick(fragment, e);
                  }}
                  className="absolute cursor-pointer pointer-events-auto transition-opacity hover:opacity-80 rounded-[1px]"
                  style={
                    isUnderline
                      ? {
                          left: `${bounds.left}px`,
                          top: `${bounds.top + bounds.height - 2.5}px`,
                          width: `${bounds.width}px`,
                          height: '2.5px',
                          backgroundColor: style.accentHex,
                          boxShadow: `0 1px 2px ${style.accentHex}40`,
                        }
                      : {
                          left: `${bounds.left}px`,
                          top: `${bounds.top}px`,
                          width: `${bounds.width}px`,
                          height: `${bounds.height}px`,
                          backgroundColor: style.bg,
                          borderBottom: `2px solid ${style.border}`,
                          mixBlendMode: 'multiply',
                        }
                  }
                  title={`${isUnderline ? 'Altı Çizili' : 'Vurgulanmış'}: "${fragment.selectedText.substring(0, 60)}..."${
                    fragment.note ? `\nNot: ${fragment.note}` : ''
                  }`}
                />
              );
            })}

            {/* Persistent Text-Based Note Pin Badge */}
            {fragment.note && firstBounds && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (onHighlightClick) onHighlightClick(fragment, e);
                }}
                className="absolute cursor-pointer pointer-events-auto z-30 flex items-center justify-center -translate-y-1/2 translate-x-1/2 group"
                style={{
                  left: `${firstBounds.left + firstBounds.width}px`,
                  top: `${firstBounds.top}px`,
                }}
              >
                <div 
                  className="w-5 h-5 rounded-full shadow-lg border border-white dark:border-neutral-900 flex items-center justify-center transition-transform hover:scale-125 active:scale-95"
                  style={{ backgroundColor: style.accentHex }}
                  title="Notu Görmek/Düzenlemek İçin Tıklayın"
                >
                  <MessageSquare className="w-2.5 h-2.5 text-white stroke-[2.5]" />
                </div>

                {/* Hover preview tooltip */}
                <div className="absolute left-full ml-2 top-0 hidden group-hover:flex flex-col bg-neutral-900/95 text-white dark:bg-neutral-100/95 dark:text-neutral-900 text-[11px] p-2 rounded-xl shadow-2xl whitespace-normal min-w-[140px] max-w-xs z-50 pointer-events-none backdrop-blur-sm border border-white/10 dark:border-black/10">
                  <span className="font-mono text-[9px] opacity-60 uppercase tracking-wider mb-0.5">KAYITLI DERS NOTU</span>
                  <span className="font-sans font-medium leading-relaxed">{fragment.note}</span>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
});

export default HighlightRenderer;
