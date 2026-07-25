/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useCallback } from 'react';
import { MaterialService } from '../services/materialService';
import { IMaterialActiveSession } from '../types/material.types';
import { Logger } from '../../../core/logger/Logger';

interface UseFileImportProps {
  onFileLoaded: (session: IMaterialActiveSession) => void;
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
        onFileLoaded(session);
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
