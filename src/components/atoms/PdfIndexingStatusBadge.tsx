import React, { useEffect, useState } from 'react';
import { PdfIndexingWorkerService, IndexingProgress } from '../../core/pdf/PdfIndexingWorkerService';

interface PdfIndexingStatusBadgeProps {
  docId: string;
}

export const PdfIndexingStatusBadge: React.FC<PdfIndexingStatusBadgeProps> = ({ docId }) => {
  const [progress, setProgress] = useState<IndexingProgress>(() =>
    PdfIndexingWorkerService.getStatus(docId)
  );

  useEffect(() => {
    const unsubscribe = PdfIndexingWorkerService.subscribe(docId, (newProgress) => {
      setProgress(newProgress);
    });
    return unsubscribe;
  }, [docId]);

  if (progress.status === 'idle') return null;

  return (
    <div
      title={
        progress.status === 'indexing'
          ? `Metin indeksi hazırlanıyor (%${progress.progressPercent})`
          : 'Metin indeksi hazır'
      }
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full font-mono transition-opacity bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          progress.status === 'indexing'
            ? 'bg-amber-500 animate-pulse'
            : progress.status === 'ready'
            ? 'bg-emerald-500'
            : 'bg-stone-400'
        }`}
      />
      <span className="text-[11px] select-none">
        {progress.status === 'indexing'
          ? `%${progress.progressPercent}`
          : 'Arama Hazır'}
      </span>
    </div>
  );
};
