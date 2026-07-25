/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Book, Calendar, ChevronRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Logger } from '../../core/logger/Logger';
import { INotebook, NotebookType, NOTEBOOK_TYPE_LABELS } from '../../core/notebooks/NotebookModel';
import { NotebookService } from '../../core/notebooks/NotebookService';
import { NewNotebookModal } from '../molecules/NewNotebookModal';
import { WritingEditorScreen } from './WritingEditorScreen';

export const FocusScreen: React.FC = () => {
  const navigate = useNavigate();
  const { themeType, toggleTheme } = useTheme();

  // State
  const [notebooks, setNotebooks] = useState<INotebook[]>([]);
  const [activeNotebook, setActiveNotebook] = useState<INotebook | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);

  // Load notebooks on mount
  useEffect(() => {
    async function loadNotebooks() {
      setIsLoading(true);
      try {
        Logger.info('FocusScreen', 'Loading Yazıhane notebooks list...');
        const list = await NotebookService.getNotebooks();
        setNotebooks(list);
      } catch (err) {
        Logger.error('FocusScreen', 'Failed to load notebooks list', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadNotebooks();
  }, []);

  /**
   * Create Notebook Handler
   */
  const handleCreateNotebook = async (title: string, type: NotebookType) => {
    try {
      const created = await NotebookService.createNotebook(title, type);
      setNotebooks(prev => [created, ...prev]);
      // Open created notebook in editor immediately
      setActiveNotebook(created);
    } catch (err) {
      Logger.error('FocusScreen', 'Error creating new notebook', err);
    }
  };

  /**
   * Callback when active notebook is updated inside editor
   */
  const handleNotebookUpdated = (updated: INotebook) => {
    setActiveNotebook(updated);
    setNotebooks(prev => 
      prev.map(nb => nb.metadata.id === updated.metadata.id ? updated : nb)
    );
  };

  // Helper to format date cleanly
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // If a notebook is selected, render Full Screen Writing Editor
  if (activeNotebook) {
    return (
      <WritingEditorScreen
        notebook={activeNotebook}
        onBack={() => setActiveNotebook(null)}
        onNotebookUpdated={handleNotebookUpdated}
      />
    );
  }

  // Otherwise, render Yazıhane Main Screen (Defter Listesi)
  return (
    <div 
      className="min-h-screen w-screen flex flex-col select-none overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Header */}
      <header 
        className="h-14 px-6 border-b flex items-center justify-between shrink-0"
        style={{
          borderColor: 'var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
        }}
      >
        {/* Left: Salona Dön */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer opacity-80 hover:opacity-100"
            style={{ borderColor: 'var(--color-border-subtle)' }}
            title="Ana Salona Dön"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Salona Dön</span>
          </button>
          <span className="text-xs font-serif font-semibold tracking-widest uppercase opacity-60">
            YAZIHANE
          </span>
        </div>

        {/* Right: Only One Main Action Button "➕ Yeni Defter" + Theme toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title="Yeni Defter Oluştur"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Defter</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 opacity-70 transition-colors"
            style={{ borderColor: 'var(--color-border-subtle)' }}
            title="Temayı Değiştir"
          >
            {themeType === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Area - Defter Listesi */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-12 flex justify-center items-start">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          {/* Subtitle / Description */}
          <div className="flex flex-col gap-1 pb-2 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <h2 className="text-sm font-serif font-semibold tracking-wide">
              DEFTERLERİM
            </h2>
            <p className="text-xs font-mono opacity-50">
              Sessiz düşüncelerin ve metinlerin olgunlaştığı çalışma odası.
            </p>
          </div>

          {/* Defter List Container */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 opacity-50">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Defterler yükleniyor...</span>
            </div>
          ) : notebooks.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-50 gap-3 border border-dashed rounded-2xl" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <Book className="w-10 h-10 stroke-1 text-amber-500" />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-mono font-medium">Henüz bir defter oluşturulmadı.</p>
                <p className="text-[11px] font-mono opacity-70">
                  Sağ üst köşedeki <b>"➕ Yeni Defter"</b> butonunu kullanarak ilk çalışmanızı başlatın.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col border rounded-2xl overflow-hidden divide-y shadow-sm" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {/* Header Row */}
              <div 
                className="px-6 py-3 font-mono text-[11px] uppercase tracking-wider grid grid-cols-12 gap-4 opacity-50"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
              >
                <div className="col-span-6 sm:col-span-6">Defter Adı</div>
                <div className="col-span-3 sm:col-span-3">Tür</div>
                <div className="col-span-3 sm:col-span-3 text-right">Son Düzenlenme</div>
              </div>

              {/* Rows */}
              {notebooks.map((nb) => (
                <div
                  key={nb.metadata.id}
                  onClick={() => setActiveNotebook(nb)}
                  className="px-6 py-4 grid grid-cols-12 gap-4 items-center font-serif text-xs transition-all cursor-pointer hover:bg-amber-500/5 group"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                >
                  {/* Defter Adı */}
                  <div className="col-span-6 sm:col-span-6 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      <Book className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {nb.metadata.title}
                      </span>
                      <span className="text-[10px] font-mono opacity-40">
                        {nb.metadata.wordCount} kelime
                      </span>
                    </div>
                  </div>

                  {/* Tür */}
                  <div className="col-span-3 sm:col-span-3 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 opacity-80">
                      {NOTEBOOK_TYPE_LABELS[nb.metadata.type] || nb.metadata.type}
                    </span>
                  </div>

                  {/* Son Düzenlenme Tarihi */}
                  <div className="col-span-3 sm:col-span-3 font-mono text-[11px] opacity-60 text-right flex items-center justify-end gap-2">
                    <span className="hidden sm:inline">{formatDate(nb.metadata.updatedAt)}</span>
                    <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="h-8 px-6 border-t flex items-center justify-between text-[10px] font-mono opacity-50 shrink-0" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <span>Toplam {notebooks.length} Defter</span>
        <span>Passio Yazıhane • Sprint 10</span>
      </footer>

      {/* New Notebook Modal */}
      <NewNotebookModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleCreateNotebook}
      />
    </div>
  );
};

export default FocusScreen;
