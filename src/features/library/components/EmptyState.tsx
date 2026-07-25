/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Henüz Belge Bulunmuyor',
  description = 'Kütüphanenize yerel bir PDF dosyası yükleyerek veya koleksiyondan seçerek okumaya başlayabilirsiniz.',
}) => {
  return (
    <div
      className="p-12 rounded-2xl border flex flex-col items-center justify-center text-center gap-3 my-8"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      <div className="p-4 rounded-full bg-black/5 dark:bg-white/5 opacity-60">
        <BookOpen className="w-8 h-8 text-accent" />
      </div>
      <h3 className="text-base font-serif font-medium">{title}</h3>
      <p className="text-xs max-w-md opacity-70 font-sans" style={{ color: 'var(--color-text-secondary)' }}>
        {description}
      </p>
    </div>
  );
};
