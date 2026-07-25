/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Archive, Lock } from 'lucide-react';
import { Header } from '../../shared/ui/Header';
import { useNavigate } from 'react-router-dom';

export const ArchiveScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen w-screen flex flex-col select-none overflow-x-hidden"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      <Header title="ARŞİV" onBack={() => navigate('/')} backLabel="Ana Salon" />

      <main className="flex-1 max-w-4xl w-full mx-auto p-8 flex flex-col items-center justify-center text-center gap-6">
        <div className="p-4 rounded-2xl border" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg-surface)' }}>
          <Archive className="w-8 h-8 text-accent" />
        </div>

        <div className="flex flex-col gap-2 max-w-md">
          <h1 className="text-xl font-serif font-medium">Güvenli Yerel Arşiv</h1>
          <p className="text-xs leading-relaxed opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
            Mühürlenen yazılar, tamamlanmış metinler ve saklanan tüm dökümanlar yerel diskte şifreli olarak saklanır.
          </p>
        </div>

        <div className="p-6 rounded-2xl border w-full max-w-md flex items-center justify-center gap-3 text-xs font-mono opacity-50" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <Lock className="w-4 h-4" />
          <span>Henüz mühürlenmiş döküman bulunmuyor</span>
        </div>
      </main>
    </div>
  );
};

export default ArchiveScreen;
