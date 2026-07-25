/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, GitBranch, BookOpen, Sliders, RefreshCw, Check } from 'lucide-react';
import { INotebook } from '../../../core/notebooks/NotebookModel';

interface WritingRoomHeaderProps {
  notebook: INotebook;
  saveStatus: 'saved' | 'saving' | 'error';
  wordCount: number;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  onBack: () => void;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onOpenSettings: () => void;
}

export const WritingRoomHeader: React.FC<WritingRoomHeaderProps> = ({
  notebook,
  saveStatus,
  wordCount,
  isLeftPanelOpen,
  isRightPanelOpen,
  onBack,
  onToggleLeftPanel,
  onToggleRightPanel,
  onOpenSettings,
}) => {
  return (
    <header
      className="h-14 px-6 border-b flex items-center justify-between shrink-0 select-none z-10"
      style={{
        borderColor: 'var(--color-border-subtle)',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer opacity-80 hover:opacity-100"
          style={{ borderColor: 'var(--color-border-subtle)' }}
          title="Defter Listesine Dön"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Defterler</span>
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-xs font-serif font-semibold tracking-wide">
            {notebook.metadata.title}
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            {notebook.metadata.type}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Save Status & Word Count */}
        <div className="flex items-center gap-2 text-[11px] font-mono opacity-60">
          <span className="flex items-center gap-1">
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Otomatik Kaydedildi</span>
              </>
            )}
          </span>
          <span>•</span>
          <span>{wordCount} Kelime</span>
        </div>

        <div className="h-4 w-px bg-current opacity-10" />

        {/* Panel Toggles */}
        <div className="flex items-center gap-1">
          {/* Left Panel Toggle (Bilgi Parçaları) */}
          <button
            onClick={onToggleLeftPanel}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isLeftPanelOpen
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-400 font-semibold'
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
            }`}
            style={!isLeftPanelOpen ? { borderColor: 'var(--color-border-subtle)' } : {}}
            title="Bilgi Parçaları Paneli"
          >
            <GitBranch className="w-4 h-4" />
          </button>

          {/* Right Panel Toggle (Belge Bilgileri) */}
          <button
            onClick={onToggleRightPanel}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isRightPanelOpen
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-400 font-semibold'
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
            }`}
            style={!isRightPanelOpen ? { borderColor: 'var(--color-border-subtle)' } : {}}
            title="Belge Bilgileri & Kaynaklar"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 transition-all cursor-pointer"
            style={{ borderColor: 'var(--color-border-subtle)' }}
            title="Sayfa & Tipografi Ayarları"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
