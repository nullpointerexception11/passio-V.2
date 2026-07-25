/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, Sliders, Type, Maximize2, AlignLeft, Sun, Moon } from 'lucide-react';
import { INotebookSettings } from '../../core/notebooks/NotebookModel';
import { useTheme } from '../../core/theme/ThemeContext';

interface NotebookSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: INotebookSettings;
  onChangeSettings: (newSettings: Partial<INotebookSettings>) => void;
}

export const NotebookSettingsModal: React.FC<NotebookSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
}) => {
  const { themeType, toggleTheme } = useTheme();

  if (!isOpen) return null;

  const fontOptions: { key: INotebookSettings['fontFamily']; label: string; preview: string }[] = [
    { key: 'serif', label: 'Serif', preview: 'font-serif' },
    { key: 'sans', label: 'Sans-Serif', preview: 'font-sans' },
    { key: 'mono', label: 'Monospace', preview: 'font-mono' },
    { key: 'system', label: 'Sistem', preview: 'font-sans' },
  ];

  const fontSizeOptions = [14, 16, 18, 20, 24];
  const lineHeightOptions = [1.4, 1.6, 1.8, 2.0];
  const maxWidthOptions = [
    { key: '65ch', label: 'Dar (65ch)' },
    { key: '75ch', label: 'Standart (75ch)' },
    { key: '85ch', label: 'Geniş (85ch)' },
    { key: '100%', label: 'Tam Ekran' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-subtle)',
          color: 'var(--color-text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-serif font-semibold tracking-wide uppercase">
              Yazıhane Ayarları
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 opacity-60" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6 font-mono text-xs">
          {/* Yazı Tipi */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-wider opacity-60 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              Yazı Tipi (Font Family)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fontOptions.map((f) => (
                <button
                  key={f.key}
                  onClick={() => onChangeSettings({ fontFamily: f.key })}
                  className={`px-3 py-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${
                    settings.fontFamily === f.key 
                      ? 'border-amber-500 bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                  }`}
                  style={settings.fontFamily !== f.key ? { borderColor: 'var(--color-border-subtle)' } : {}}
                >
                  <span className={f.preview}>{f.label}</span>
                  {settings.fontFamily === f.key && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Boyutu */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-wider opacity-60 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              Font Boyutu ({settings.fontSize}px)
            </label>
            <div className="flex items-center gap-2">
              {fontSizeOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => onChangeSettings({ fontSize: size })}
                  className={`flex-1 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                    settings.fontSize === size 
                      ? 'border-amber-500 bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                  }`}
                  style={settings.fontSize !== size ? { borderColor: 'var(--color-border-subtle)' } : {}}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>

          {/* Satır Aralığı */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-wider opacity-60 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" />
              Satır Aralığı ({settings.lineHeight})
            </label>
            <div className="flex items-center gap-2">
              {lineHeightOptions.map((lh) => (
                <button
                  key={lh}
                  onClick={() => onChangeSettings({ lineHeight: lh })}
                  className={`flex-1 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                    settings.lineHeight === lh 
                      ? 'border-amber-500 bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                  }`}
                  style={settings.lineHeight !== lh ? { borderColor: 'var(--color-border-subtle)' } : {}}
                >
                  {lh}
                </button>
              ))}
            </div>
          </div>

          {/* Sayfa Genişliği */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-wider opacity-60 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5" />
              Sayfa Genişliği
            </label>
            <div className="grid grid-cols-2 gap-2">
              {maxWidthOptions.map((mw) => (
                <button
                  key={mw.key}
                  onClick={() => onChangeSettings({ maxWidth: mw.key })}
                  className={`px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                    settings.maxWidth === mw.key 
                      ? 'border-amber-500 bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                  }`}
                  style={settings.maxWidth !== mw.key ? { borderColor: 'var(--color-border-subtle)' } : {}}
                >
                  {mw.label}
                </button>
              ))}
            </div>
          </div>

          {/* Açık / Koyu Tema Uyumu */}
          <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <span className="text-[11px] uppercase tracking-wider opacity-60 flex items-center gap-1.5">
              {themeType === 'light' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              Tema Modu
            </span>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <span>{themeType === 'light' ? 'Açık Tema' : 'Koyu Tema'}</span>
              <span className="text-[10px] opacity-50">(Değiştir)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
