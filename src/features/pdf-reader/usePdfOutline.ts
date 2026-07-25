import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfOutlineService, TocItem } from '../../core/pdf/PdfOutlineService';

export function usePdfOutline(pdfDoc: pdfjsLib.PDFDocumentProxy | null) {
  const [outline, setOutline] = useState<TocItem[]>([]);
  const [isLoadingOutline, setIsLoadingOutline] = useState<boolean>(false);

  useEffect(() => {
    if (!pdfDoc) {
      setOutline([]);
      return;
    }

    let isSubscribed = true;
    setIsLoadingOutline(true);

    PdfOutlineService.getOutline(pdfDoc)
      .then((items) => {
        if (isSubscribed) {
          setOutline(items);
          setIsLoadingOutline(false);
        }
      })
      .catch((err) => {
        console.warn('[usePdfOutline] Error loading outline:', err);
        if (isSubscribed) {
          setOutline([]);
          setIsLoadingOutline(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [pdfDoc]);

  return { outline, isLoadingOutline };
}
