/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useCallback } from 'react';
import { MaterialService } from '../services/materialService';
import { IDocumentMetadata, IMaterialActiveSession } from '../types/material.types';
import { Logger } from '../../../core/logger/Logger';
import { useToast } from '../../../components/common/ToastContext';

interface UseFileImportProps {
  onFileLoaded: (metadata: IDocumentMetadata) => void;
  onError?: (error: Error) => void;
}

export function useFileImport({ onFileLoaded, onError }: UseFileImportProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { addToast } = useToast();

  const triggerFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const session = await MaterialService.processUploadedFile(file);
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
          addToast(error.message, 'error');
        }
      } finally {
        if (event.target) {
          event.target.value = '';
        }
      }
    },
    [onFileLoaded, onError, addToast]
  );

  return {
    fileInputRef,
    triggerFilePicker,
    handleFileChange,
  };
}
