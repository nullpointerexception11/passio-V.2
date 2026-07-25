/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileUp, GitBranch } from 'lucide-react';

interface LibraryActionsProps {
  onOpenKnowledgeBridge: () => void;
  onUploadClick: () => void;
}

export const LibraryActions: React.FC<LibraryActionsProps> = ({
  onOpenKnowledgeBridge,
  onUploadClick,
}) => {
  return (
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
        <FileUp className="w-3.5 h-3.5 text-accent" />
        <span>PDF Yükle</span>
      </button>
    </div>
  );
};
