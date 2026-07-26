/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Check, Copy, MessageSquare, Trash2, X } from 'lucide-react';
import { HighlightColor, HIGHLIGHT_COLOR_MAP } from '../../../entities/highlight/HighlightModel';

interface HighlightToolbarProps {
  position: { x: number; y: number };
  selectedText?: string;
  selectedColor?: HighlightColor;
  initialNote?: string;
  isExistingHighlight?: boolean;
  onSelectColor: (color: HighlightColor, note?: string) => void;
  onDeleteHighlight?: () => void;
  onClose: () => void;
}

const COLORS: HighlightColor[] = ['yellow', 'green', 'blue', 'purple', 'orange', 'red'];

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  position,
  selectedText = '',
  selectedColor,
  initialNote = '',
  isExistingHighlight = false,
  onSelectColor,
  onDeleteHighlight,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(Boolean(initialNote));
  const [noteText, setNoteText] = useState(initialNote);
  const [activeColor, setActiveColor] = useState<HighlightColor>(selectedColor || 'yellow');
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut handlers (1-6 for colors, ESC to close, C to copy)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't trigger shortcuts when typing in note field
      }

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'c' || e.key === 'C') {
        handleCopyText();
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (COLORS[index]) {
          setActiveColor(COLORS[index]);
          onSelectColor(COLORS[index], noteText.trim() || undefined);
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
      // Fallback if clipboard API is restricted
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

  // Adjust toolbar coordinates to keep within screen viewport bounds
  const clampedX = Math.max(160, Math.min(window.innerWidth - 180, position.x));
  const clampedY = Math.max(70, position.y - 60);

  return (
    <div
      ref={toolbarRef}
      id="passio-highlight-floating-toolbar"
      className="fixed z-50 transform -translate-x-1/2 flex flex-col items-center gap-1.5 p-1.5 rounded-xl shadow-2xl border bg-neutral-900/95 border-neutral-700/80 text-white backdrop-blur-md transition-all duration-200 animate-in fade-in zoom-in-95"
      style={{
        left: `${clampedX}px`,
        top: `${clampedY}px`,
      }}
    >
      <div className="flex items-center gap-1">
        {/* Color Palette Presets */}
        <div className="flex items-center gap-1 px-1 py-0.5 border-r border-neutral-700/60 pr-1.5">
          {COLORS.map((colorKey) => {
            const style = HIGHLIGHT_COLOR_MAP[colorKey];
            const isSelected = activeColor === colorKey;

            return (
              <button
                key={colorKey}
                type="button"
                onClick={() => handleColorClick(colorKey)}
                title={`${style.label} Vurgula`}
                className={`w-6 h-6 rounded-full transition-all duration-150 flex items-center justify-center hover:scale-110 active:scale-95 ${
                  isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-105' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: style.accentHex }}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-neutral-950 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Copy Text Action */}
        <button
          type="button"
          onClick={handleCopyText}
          title={copied ? 'Kopyalandı!' : 'Metni Kopyala (C)'}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1 text-xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied && <span className="text-[10px] text-emerald-400 font-medium">Kopyalandı</span>}
        </button>

        {/* Note Toggle Action */}
        <button
          type="button"
          onClick={() => setShowNoteInput(!showNoteInput)}
          title="Not / Açıklama Ekle"
          className={`p-1.5 rounded-lg transition-colors flex items-center ${
            showNoteInput || noteText
              ? 'text-amber-400 bg-neutral-800'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Delete Action (if existing highlight) */}
        {isExistingHighlight && onDeleteHighlight && (
          <button
            type="button"
            onClick={() => {
              onDeleteHighlight();
            }}
            title="Vurguyu Sil"
            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Close Action */}
        <button
          type="button"
          onClick={onClose}
          title="Kapat (Esc)"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Note Input Drawer */}
      {showNoteInput && (
        <form onSubmit={handleNoteSubmit} className="w-full flex items-center gap-1 pt-1.5 border-t border-neutral-800 px-1">
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
            className="px-2 py-1 text-xs font-medium bg-amber-500 text-neutral-950 rounded-md hover:bg-amber-400 transition-colors"
          >
            Kaydet
          </button>
        </form>
      )}
    </div>
  );
};

export default HighlightToolbar;
