/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { INotebookSettings } from '../../../core/notebooks/NotebookModel';
import { WritingBubbleMenu } from './WritingBubbleMenu';

interface TipTapEditorProps {
  notebookId?: string;
  initialContent: string;
  settings: INotebookSettings;
  onChange: (text: string) => void;
  onDropKnowledgeItem?: (itemJson: string) => void;
  isTypewriterMode?: boolean;
  isLeftPanelOpen?: boolean;
  isRightPanelOpen?: boolean;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  notebookId,
  initialContent,
  settings,
  onChange,
  onDropKnowledgeItem,
  isTypewriterMode = false,
}) => {
  const isInternalUpdate = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasRestoredCursor = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Düşüncelerinizi buraya özgürce aktarın...',
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      const html = editor.getHTML();
      onChange(html);

      // Save cursor position
      if (notebookId) {
        const { selection } = editor.state;
        if (selection) {
          localStorage.setItem(
            `passio_notebook_cursor_${notebookId}`,
            JSON.stringify({ from: selection.from, to: selection.to })
          );
        }
      }
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px] w-full prose prose-stone dark:prose-invert max-w-none',
      },
    },
  });

  // Restore cursor selection & scroll position on editor load
  useEffect(() => {
    if (!editor || !notebookId || hasRestoredCursor.current) return;
    hasRestoredCursor.current = true;

    // Restore cursor position
    const savedCursor = localStorage.getItem(`passio_notebook_cursor_${notebookId}`);
    if (savedCursor) {
      try {
        const { from, to } = JSON.parse(savedCursor);
        const docSize = editor.state.doc.content.size;
        const safeFrom = Math.min(Math.max(1, from), docSize);
        const safeTo = Math.min(Math.max(1, to), docSize);

        setTimeout(() => {
          if (!editor.isDestroyed) {
            editor.commands.setTextSelection({ from: safeFrom, to: safeTo });
            editor.commands.focus();
          }
        }, 100);
      } catch {
        // ignore
      }
    }

    // Restore scroll position
    const savedScroll = localStorage.getItem(`passio_notebook_scroll_${notebookId}`);
    if (savedScroll && containerRef.current) {
      const scrollTop = parseInt(savedScroll, 10);
      if (!isNaN(scrollTop)) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = scrollTop;
          }
        }, 120);
      }
    }
  }, [editor, notebookId]);

  // Track cursor position changes
  useEffect(() => {
    if (!editor) return;

    const handleSelection = () => {
      if (notebookId) {
        const { selection } = editor.state;
        if (selection) {
          localStorage.setItem(
            `passio_notebook_cursor_${notebookId}`,
            JSON.stringify({ from: selection.from, to: selection.to })
          );
        }
      }

      if (isTypewriterMode) {
        scrollToCursor();
      }
    };

    editor.on('selectionUpdate', handleSelection);
    return () => {
      editor.off('selectionUpdate', handleSelection);
    };
  }, [editor, notebookId, isTypewriterMode]);

  // Typewriter Mode Center Scroll Logic
  const scrollToCursor = useCallback(() => {
    if (!isTypewriterMode || !editor || !containerRef.current) return;
    const { selection } = editor.state;
    if (!selection) return;

    try {
      const domAtPos = editor.view.domAtPos(selection.from);
      let element = domAtPos.node as HTMLElement;
      if (element && element.nodeType === Node.TEXT_NODE) {
        element = element.parentElement as HTMLElement;
      }

      if (element && containerRef.current) {
        const container = containerRef.current;
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const relativeTop = rect.top - containerRect.top + container.scrollTop;
        const targetScrollTop = relativeTop - containerRect.height * 0.45;

        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth',
        });
      }
    } catch {
      // ignore
    }
  }, [editor, isTypewriterMode]);

  useEffect(() => {
    if (!editor) return;

    const handleSelection = () => {
      if (isTypewriterMode) {
        scrollToCursor();
      }
    };

    editor.on('selectionUpdate', handleSelection);
    editor.on('update', handleSelection);

    return () => {
      editor.off('selectionUpdate', handleSelection);
      editor.off('update', handleSelection);
    };
  }, [editor, isTypewriterMode, scrollToCursor]);

  // Sync editor content when initialContent changes externally
  useEffect(() => {
    if (editor && !isInternalUpdate.current) {
      if (editor.getHTML() !== initialContent && initialContent) {
        editor.commands.setContent(initialContent);
      }
    }
    isInternalUpdate.current = false;
  }, [initialContent, editor]);

  // Handle Drag & Drop of Knowledge Items
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer.getData('application/json');
      if (data && onDropKnowledgeItem) {
        onDropKnowledgeItem(data);
      }
    },
    [onDropKnowledgeItem]
  );

  const getFontFamilyClass = (fontFamily: INotebookSettings['fontFamily']) => {
    switch (fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'sans':
        return 'font-sans';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-serif';
    }
  };

  const getTextColorClass = (color?: string) => {
    switch (color) {
      case 'amber':
        return 'text-amber-800 dark:text-amber-300';
      case 'blue':
        return 'text-blue-800 dark:text-blue-300';
      case 'emerald':
        return 'text-emerald-800 dark:text-emerald-300';
      default:
        return '';
    }
  };

  const getFontWeightClass = (weight?: string) => {
    switch (weight) {
      case 'medium':
        return 'font-medium';
      case 'semibold':
        return 'font-semibold';
      default:
        return 'font-normal';
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={(e) => {
        if (notebookId) {
          const target = e.currentTarget;
          localStorage.setItem(`passio_notebook_scroll_${notebookId}`, target.scrollTop.toString());
        }
      }}
      className={`w-full flex flex-col items-center h-full overflow-y-auto px-4 transition-all duration-300 ${
        isTypewriterMode ? 'pt-[42vh] pb-[52vh]' : 'pt-16 sm:pt-20 pb-16'
      }`}
    >
      <WritingBubbleMenu editor={editor} />

      {/* Editor Main Canvas Container */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`w-full flex-1 transition-all ${getFontFamilyClass(settings.fontFamily)} ${getTextColorClass(settings.textColor)} ${getFontWeightClass(settings.fontWeight)}`}
        style={{
          maxWidth: settings.maxWidth || '760px',
          fontSize: `${settings.fontSize || 16}px`,
          lineHeight: settings.lineHeight || 1.8,
          color: !settings.textColor || settings.textColor === 'default' ? 'var(--color-text-primary)' : undefined,
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
