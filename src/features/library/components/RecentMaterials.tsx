/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HardDrive, BookOpen, Eye } from 'lucide-react';
import { IMaterialActiveSession } from '../types/material.types';

interface RecentMaterialsProps {
  customPdfs: IMaterialActiveSession[];
  onSelect: (session: IMaterialActiveSession) => void;
}

export const RecentMaterials: React.FC<RecentMaterialsProps> = ({ customPdfs, onSelect }) => {
  if (customPdfs.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 opacity-80">
        YÜKLENEN BELGELER ({customPdfs.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customPdfs.map((pdf) => (
          <div
            key={pdf.docId}
            onClick={() => onSelect(pdf)}
            className="p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 hover:border-amber-500/50 hover:shadow-lg group"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <div className="flex items-center gap-3.5 truncate">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col truncate">
                <span className="font-serif font-medium text-sm truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {pdf.title}
                </span>
                <span className="text-[10px] font-mono opacity-50 tracking-wide">Yerel Cihaz Dosyası • PDF</span>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 opacity-80 group-hover:opacity-100 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all cursor-pointer">
              <Eye className="w-3.5 h-3.5" />
              <span>Oku</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
