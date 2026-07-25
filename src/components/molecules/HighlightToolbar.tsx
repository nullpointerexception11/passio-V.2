/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Highlighter, Underline, FileText, Check, X } from 'lucide-react';
import { HighlightColor, HIGHLIGHT_COLOR_MAP, HighlightStyleType } from '../../core/highlight/HighlightModel';

interface HighlightToolbarProps {
  position: { x: number; y: number };
  onSelectColor: (color: HighlightColor, styleType: HighlightStyleType, note?: string) => void;
  onSaveNote?: (note: string) => void;
  onDelete?: () => void;
  isExisting?: boolean;
  initialNote?: string;
  initialColor?: HighlightColor;
  initialStyleType?: HighlightStyleType;
}

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  position,
  onSelectColor,
  onSaveNote,
  onDelete,
  isExisting = false,
  initialNote = '',
  initialColor = 'yellow',
  initialStyleType = 'highlight',
}) => {
  const [styleType, setStyleType] = useState<HighlightStyleType>(initialStyleType);
  const [selectedColor, setSelectedColor] = useState<HighlightColor>(initialColor);
  const [showNoteEditor, setShowNoteEditor] = useState<boolean>(!!initialNote);
  const [noteText, setNoteText] = useState<string>(initialNote);

  const colors: HighlightColor[] = ['yellow', 'blue', 'green', 'red'];

  const handleSave = () => {
    if (isExisting && onSaveNote) {
      onSaveNote(noteText);
    } else {
      onSelectColor(selectedColor, styleType, noteText);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 6 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="fixed z-50 flex flex-col gap-2 p-2 rounded-2xl border shadow-2xl backdrop-blur-md select-none max-w-xs sm:max-w-sm"
      style={{
        left: `${Math.max(120, Math.min(window.innerWidth - 140, position.x))}px`,
        top: `${Math.max(60, position.y - (showNoteEditor ? 140 : 54))}px`,
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border-subtle)',
        boxShadow: 'var(--shadows-large)',
        color: 'var(--color-text-primary)',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Primary Toolbar Controls Bar */}
      <div className="flex items-center gap-2 px-1 py-0.5">
        {/* Mode Switch: Highlighting vs Underlining */}
        <div className="flex items-center gap-1 p-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStyleType('highlight');
              if (isExisting && onSaveNote) {
                onSelectColor(selectedColor, 'highlight', noteText);
              }
            }}
            className={`p-1 rounded-full transition-colors cursor-pointer ${
              styleType === 'highlight'
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            title="Vurgulama Modu (Metin Arka Planı)"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStyleType('underline');
              if (isExisting && onSaveNote) {
                onSelectColor(selectedColor, 'underline', noteText);
              }
            }}
            className={`p-1 rounded-full transition-colors cursor-pointer ${
              styleType === 'underline'
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            title="Altını Çizme Modu (Çizgi)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800" />

        {/* 4 Core Colors: Yellow, Blue, Green, Red */}
        <div className="flex items-center gap-2">
          {colors.map((color) => {
            const style = HIGHLIGHT_COLOR_MAP[color];
            const isCurrentColor = selectedColor === color;
            return (
              <button
                key={color}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(color);
                  if (!showNoteEditor) {
                    onSelectColor(color, styleType, noteText);
                  }
                }}
                className={`w-5 h-5 rounded-full border cursor-pointer transition-transform hover:scale-125 active:scale-95 flex items-center justify-center relative group ${
                  isCurrentColor ? 'ring-2 ring-amber-500/80 scale-110' : ''
                }`}
                style={{
                  backgroundColor: style.accentHex,
                  borderColor: 'rgba(0, 0, 0, 0.15)',
                }}
                title={`${styleType === 'underline' ? 'Altını Çiz' : 'Vurgula'}: ${style.label}`}
              >
                {styleType === 'underline' && (
                  <span className="w-2.5 h-0.5 bg-white/80 rounded-full absolute bottom-0.5" />
                )}
              </button>
            );
          })}
        </div>

        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800" />

        {/* Note Action Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowNoteEditor((prev) => !prev);
          }}
          className={`p-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
            showNoteEditor || noteText
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium'
              : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="Bu Koordinat Aralığına Not / Düşünce Ekle"
        >
          <FileText className="w-3.5 h-3.5" />
          {noteText && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
        </button>

        {/* Delete button if clicking on an existing highlight */}
        {isExisting && onDelete && (
          <>
            <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
              title="Vurguyu / Notu Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Expandable Note Textarea Editor */}
      <AnimatePresence>
        {showNoteEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-800 overflow-hidden"
          >
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Bu metin aralığı için not veya düşünce ekleyin..."
              rows={3}
              autoFocus
              className="w-full text-xs font-sans p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-amber-500 transition-colors resize-none"
            />
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="opacity-50 text-[10px]">VERİTABANINA KAYDEDİLİR</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNoteEditor(false);
                  }}
                  className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-medium flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                >
                  <Check className="w-3 h-3" />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HighlightToolbar;
