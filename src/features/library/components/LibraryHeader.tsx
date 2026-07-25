/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, GitBranch, FileUp, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../core/theme/ThemeContext';

interface LibraryHeaderProps {
  onBack: () => void;
  onOpenKnowledgeBridge: () => void;
  onUploadClick: () => void;
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  onBack,
  onOpenKnowledgeBridge,
  onUploadClick,
}) => {
  const { themeType, toggleTheme } = useTheme();

  return (
    <header
      className="h-14 px-6 flex items-center justify-between border-b shrink-0"
      style={{
        borderColor: 'var(--color-border-subtle)',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ana Salon</span>
        </button>
        <span className="text-xs font-serif font-medium tracking-widest uppercase opacity-60">
          KÜTÜPHANE
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenKnowledgeBridge}
          className="px-3 py-1.5 rounded-lg border font-mono text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 border-amber-500/30 text-amber-600 dark:text-amber-400"
          title="Bilgi Köprüsünü Aç"
        >
          <GitBranch className="w-3.5 h-3.5 text-amber-500" />
          <span>Bilgi Köprüsü</span>
        </button>

        <button
          onClick={onUploadClick}
          className="px-3 py-1.5 rounded-lg border font-mono text-xs font-medium flex items-center gap-2 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5"
          style={{
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
        >
          <FileUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>PDF Yükle</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          style={{ borderColor: 'var(--color-border-subtle)' }}
          title="Temayı Değiştir"
        >
          {themeType === 'light' ? <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
