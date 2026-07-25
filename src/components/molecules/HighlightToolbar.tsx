/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { HighlightColor, HIGHLIGHT_COLOR_MAP } from '../../core/highlight/HighlightModel';

interface HighlightToolbarProps {
  position: { x: number; y: number };
  onSelectColor: (color: HighlightColor) => void;
  onDelete?: () => void;
  isExisting?: boolean;
}

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  position,
  onSelectColor,
  onDelete,
  isExisting = false,
}) => {
  const colors: HighlightColor[] = ['yellow', 'blue', 'green', 'red'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 6 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="fixed z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-md select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 48}px`, // Float 48px above target selection
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border-subtle)',
        boxShadow: 'var(--shadows-large)',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 4 Core Colors: Yellow, Blue, Green, Red */}
      <div className="flex items-center gap-2">
        {colors.map((color) => {
          const style = HIGHLIGHT_COLOR_MAP[color];
          return (
            <button
              key={color}
              onClick={(e) => {
                e.stopPropagation();
                onSelectColor(color);
              }}
              className="w-5 h-5 rounded-full border cursor-pointer transition-transform hover:scale-125 active:scale-95 flex items-center justify-center"
              style={{
                backgroundColor: style.accentHex,
                borderColor: 'rgba(0, 0, 0, 0.15)',
              }}
              title={`Vurgula: ${style.label}`}
            />
          );
        })}
      </div>

      {/* Delete button if clicking on an existing highlight */}
      {isExisting && onDelete && (
        <>
          <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
            title="Vurguyu Sil"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </motion.div>
  );
};

export default HighlightToolbar;
