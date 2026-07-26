import { useState, useCallback, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfSearchService, SearchResultMatch } from '../../core/pdf/PdfSearchService';
import { PdfIndexingWorkerService } from '../../core/pdf/PdfIndexingWorkerService';

export function usePdfSearch(docId: string, pdfDoc: pdfjsLib.PDFDocumentProxy | null) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Trigger background indexing when document is loaded
  useEffect(() => {
    if (pdfDoc && docId) {
      PdfIndexingWorkerService.indexDocument(docId, pdfDoc);
    }
  }, [docId, pdfDoc]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query || query.trim().length === 0 || !pdfDoc) {
        setSearchResults([]);
        setActiveMatchIndex(0);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsSearching(true);
      try {
        const matches = await PdfSearchService.searchDocument(pdfDoc, query, abortControllerRef.current.signal);
        setSearchResults(matches);
        setActiveMatchIndex(0);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
            return;
        }
        console.warn('[usePdfSearch] Search error:', err);
        setSearchResults([]);
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
            setIsSearching(false);
        }
      }
    },
    [pdfDoc]
  );


  const nextMatch = useCallback(() => {
    if (searchResults.length === 0) return;
    setActiveMatchIndex((prev) => (prev + 1) % searchResults.length);
  }, [searchResults]);

  const previousMatch = useCallback(() => {
    if (searchResults.length === 0) return;
    setActiveMatchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
  }, [searchResults]);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  return {
    isSearchOpen,
    setIsSearchOpen,
    toggleSearch,
    searchQuery,
    searchResults,
    isSearching,
    activeMatchIndex,
    setActiveMatchIndex,
    handleSearch,
    nextMatch,
    previousMatch,
  };
}
