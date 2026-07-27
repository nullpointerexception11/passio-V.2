/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Sun, Moon, Lock, Search, Inbox } from 'lucide-react';
import { useTheme } from '../../core/theme/ThemeContext';
import { useSession } from '../../core/session/SessionContext';
import { useGlobalSearch } from '../../core/search/GlobalSearchContext';
import { useInbox } from '../../core/inbox/InboxContext';

export interface HeaderProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  actions?: React.ReactNode;
  showThemeToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  backLabel = 'Ana Salon',
  actions,
  showThemeToggle = true,
}) => {
  const { themeType, toggleTheme } = useTheme();
  const { lockSession } = useSession();
  const { openSearch } = useGlobalSearch();
  const { openCapture, openManager } = useInbox();

  return (
    <header
      className="h-14 px-6 border-b flex items-center justify-between shrink-0 select-none"
      style={{
        borderColor: 'var(--color-border-subtle)',
        backgroundColor: 'var(--color-bg-surface)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </button>
        )}
        <span className="text-xs font-serif font-semibold tracking-widest uppercase opacity-60">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={openCapture}
          className="px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 cursor-pointer transition-all hover:bg-amber-500/10 hover:border-amber-500/40 opacity-80 hover:opacity-100 text-amber-600 dark:text-amber-400 font-medium"
          style={{ borderColor: 'var(--color-border-subtle)' }}
          title="Hızlı Not (Ctrl + Shift + Space)"
        >
          <Inbox className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Gelen Kutusu</span>
        </button>

        <button
          onClick={openSearch}
          className="px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
          style={{ borderColor: 'var(--color-border-subtle)' }}
          title="Genel Arama (CTRL + K)"
        >
          <Search className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Ara</span>
          <kbd className="px-1.5 py-0.5 text-[10px] rounded border bg-black/5 dark:bg-white/5 font-mono opacity-60">
            CTRL+K
          </kbd>
        </button>

        {actions}

        {showThemeToggle && (
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 opacity-70 transition-colors"
            style={{ borderColor: 'var(--color-border-subtle)' }}
            title="Temayı Değiştir"
          >
            {themeType === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        )}

        <button
          onClick={lockSession}
          className="p-1.5 rounded-xl border cursor-pointer hover:bg-red-500/10 hover:border-red-500/30 opacity-70 hover:opacity-100 transition-colors text-neutral-400 hover:text-red-500"
          style={{ borderColor: 'var(--color-border-subtle)' }}
          title="Oturumu Kilitle (Çıkış Yap)"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
