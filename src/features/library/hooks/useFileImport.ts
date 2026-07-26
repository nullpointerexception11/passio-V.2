/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useCallback } from 'react';
import { MaterialService } from '../services/materialService';
import { IDocumentMetadata, IMaterialActiveSession } from '../types/material.types';
import { Logger } from '../../../core/logger/Logger';

interface UseFileImportProps {
  onFileLoaded: (metadata: IDocumentMetadata) => void;
  onError?: (error: Error) => void;
}

export function useFileImport({ onFileLoaded, onError }: UseFileImportProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const session = await MaterialService.processUploadedFile(file);
        // We only have the metadata now after update, but let's see what MaterialService returns
        // MaterialService.processUploadedFile returns IMaterialActiveSession.
        // I need to update MaterialService to return metadata too, or just use docId/title from session.
        onFileLoaded({
            docId: session.docId,
            title: session.title,
            filePath: `PdfFiles/${session.docId}.pdf`, // This is the logic used in PdfStorageService
            createdAt: new Date().toISOString(),
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Dosya yükleme hatası');
        Logger.error('useFileImport', 'File import failed', error);
        if (onError) {
          onError(error);
        } else {
          alert(error.message);
        }
      } finally {
        if (event.target) {
          event.target.value = '';
        }
      }
    },
    [onFileLoaded, onError]
  );

  return {
    fileInputRef,
    triggerFilePicker,
    handleFileChange,
  };
}
