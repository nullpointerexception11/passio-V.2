/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Sun, Moon, Lock } from 'lucide-react';
import { useTheme } from '../../core/theme/ThemeContext';
import { useSession } from '../../core/session/SessionContext';

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
