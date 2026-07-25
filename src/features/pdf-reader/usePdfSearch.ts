/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfSearchEngine, IPdfSearchMatch } from '../../core/pdf/PdfSearchService';
import { Logger } from '../../core/logger/Logger';

export interface UsePdfSearchOptions {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  onJumpToPage?: (pageNumber: number) => void;
}

export function usePdfSearch({ pdfDoc, onJumpToPage }: UsePdfSearchOptions) {
  const [query, setQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [matches, setMatches] = useState<IPdfSearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Perform search whenever query or pdfDoc changes
  useEffect(() => {
    if (!pdfDoc || !query.trim() || query.trim().length < 2) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      setIsSearching(false);
      return;
    }

    let isSubscribed = true;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await PdfSearchEngine.search(pdfDoc, query);
        if (!isSubscribed) return;

        setMatches(results);
        setIsSearching(false);

        if (results.length > 0) {
          setCurrentMatchIndex(0);
          if (onJumpToPage) {
            onJumpToPage(results[0].pageNumber);
          }
        } else {
          setCurrentMatchIndex(-1);
        }
      } catch (err) {
        Logger.error('usePdfSearch', 'Error performing PDF keyword search', err);
        if (isSubscribed) {
          setMatches([]);
          setCurrentMatchIndex(-1);
          setIsSearching(false);
        }
      }
    }, 200);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [pdfDoc, query, onJumpToPage]);

  // Jump to specific match index
  const jumpToMatch = useCallback(
    (index: number) => {
      if (matches.length === 0) return;
      const validIndex = Math.max(0, Math.min(matches.length - 1, index));
      setCurrentMatchIndex(validIndex);

      const targetMatch = matches[validIndex];
      if (targetMatch && onJumpToPage) {
        onJumpToPage(targetMatch.pageNumber);
      }
    },
    [matches, onJumpToPage]
  );

  // Navigate to next match
  const nextMatch = useCallback(() => {
    if (matches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matches.length;
    jumpToMatch(nextIdx);
  }, [matches.length, currentMatchIndex, jumpToMatch]);

  // Navigate to previous match
  const prevMatch = useCallback(() => {
    if (matches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matches.length) % matches.length;
    jumpToMatch(prevIdx);
  }, [matches.length, currentMatchIndex, jumpToMatch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setMatches([]);
    setCurrentMatchIndex(-1);
    setIsSearching(false);
  }, []);

  // Filter matches for a specific page number
  const getMatchesForPage = useCallback(
    (pageNumber: number): IPdfSearchMatch[] => {
      return matches.filter((m) => m.pageNumber === pageNumber);
    },
    [matches]
  );

  const currentMatch = useMemo(() => {
    if (currentMatchIndex >= 0 && currentMatchIndex < matches.length) {
      return matches[currentMatchIndex];
    }
    return null;
  }, [matches, currentMatchIndex]);

  return {
    query,
    setQuery,
    isSearching,
    matches,
    totalMatches: matches.length,
    currentMatchIndex,
    currentMatch,
    isSearchOpen,
    setIsSearchOpen,
    nextMatch,
    prevMatch,
    jumpToMatch,
    clearSearch,
    getMatchesForPage,
  };
}
