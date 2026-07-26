/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, MessageSquare, Trash2, X } from 'lucide-react';
import { HighlightColor, HIGHLIGHT_COLOR_MAP } from '../../core/highlight/HighlightModel';
import { copyToClipboard } from '../../shared/utils/copyToClipboard';

interface HighlightToolbarProps {
  position: { x: number; y: number };
  bottomY?: number;
  selectedText?: string;
  selectedColor?: HighlightColor;
  initialNote?: string;
  isExisting?: boolean;
  onSelectColor: (color: HighlightColor, note?: string) => void;
  onDelete?: () => void;
  onClose?: () => void;
}

const ALL_COLORS: HighlightColor[] = ['yellow', 'green', 'blue', 'purple', 'orange', 'red'];

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  position,
  bottomY,
  selectedText = '',
  selectedColor,
  initialNote = '',
  isExisting = false,
  onSelectColor,
  onDelete,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(Boolean(initialNote));
  const [noteText, setNoteText] = useState(initialNote);
  const [activeColor, setActiveColor] = useState<HighlightColor>(selectedColor || 'yellow');

  // Keyboard accessibility (1-6 for colors, ESC to dismiss, C to copy text)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape' && onClose) {
        onClose();
      } else if (e.key === 'c' || e.key === 'C') {
        handleCopyText();
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const color = ALL_COLORS[idx];
        if (color) {
          setActiveColor(color);
          onSelectColor(color, noteText.trim() || undefined);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [noteText, onClose, onSelectColor]);

  const handleCopyText = async () => {
    if (!selectedText) return;
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback if clipboard API restricted
    }
  };

  const handleColorClick = (color: HighlightColor) => {
    setActiveColor(color);
    onSelectColor(color, noteText.trim() || undefined);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectColor(activeColor, noteText.trim() || undefined);
  };

  const clampedX = Math.max(160, Math.min(window.innerWidth - 180, position.x));
  
  const hasSpaceAbove = position.y - 54 >= 65;
  const targetY = (bottomY !== undefined && !hasSpaceAbove)
    ? bottomY + 12
    : position.y - 54;
  const clampedY = Math.max(65, targetY);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 6 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="fixed z-50 flex flex-col items-center gap-1.5 p-1.5 rounded-xl shadow-2xl border backdrop-blur-md select-none"
      style={{
        left: `${clampedX}px`,
        top: `${clampedY}px`,
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--color-bg-surface, #18181b)',
        borderColor: 'var(--color-border-subtle, #3f3f46)',
        color: 'var(--color-text-primary, #ffffff)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1">
        {/* Color Palette Presets */}
        <div className="flex items-center gap-1.5 px-1 py-0.5 border-r border-neutral-700/60 pr-2">
          {ALL_COLORS.map((colorKey) => {
            const style = HIGHLIGHT_COLOR_MAP[colorKey];
            const isSelected = activeColor === colorKey;

            return (
              <button
                key={colorKey}
                type="button"
                onClick={() => handleColorClick(colorKey)}
                title={`${style.label} Vurgula`}
                className={`w-5 h-5 rounded-full transition-transform duration-150 flex items-center justify-center hover:scale-125 cursor-pointer ${
                  isSelected ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-neutral-900 scale-110' : 'opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: style.accentHex }}
              >
                {isSelected && <Check className="w-3 h-3 text-neutral-950 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Copy Text Action */}
        <button
          type="button"
          onClick={handleCopyText}
          title={copied ? 'Kopyalandı!' : 'Metni Kopyala (C)'}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1 text-xs cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied && <span className="text-[10px] text-emerald-400 font-medium">Kopyalandı</span>}
        </button>

        {/* Note Toggle Action */}
        <button
          type="button"
          onClick={() => setShowNoteInput(!showNoteInput)}
          title="Not / Açıklama Ekle"
          className={`p-1.5 rounded-lg transition-colors flex items-center cursor-pointer ${
            showNoteInput || noteText
              ? 'text-amber-400 bg-neutral-800'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>

        {/* Delete Action (for existing highlights) */}
        {isExisting && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title="Vurguyu Sil"
            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            title="Kapat (Esc)"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer ml-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Note Input Drawer */}
      {showNoteInput && (
        <form onSubmit={handleNoteSubmit} className="w-full flex items-center gap-1.5 pt-1.5 border-t border-neutral-800 px-1">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Kişisel not ekleyin..."
            autoFocus
            className="w-48 px-2.5 py-1 text-xs bg-neutral-950 border border-neutral-700/80 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-2 py-1 text-xs font-medium bg-amber-500 text-neutral-950 rounded-md hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Kaydet
          </button>
        </form>
      )}
    </motion.div>
  );
};

export default HighlightToolbar;
