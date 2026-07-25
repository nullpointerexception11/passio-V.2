/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { INotebookSettings } from '../../../core/notebooks/NotebookModel';
import { WritingToolbar } from './WritingToolbar';

interface TipTapEditorProps {
  initialContent: string;
  settings: INotebookSettings;
  onChange: (text: string) => void;
  onDropKnowledgeItem?: (itemJson: string) => void;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  initialContent,
  settings,
  onChange,
  onDropKnowledgeItem,
}) => {
  const isInternalUpdate = useRef(false);

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
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px] w-full prose prose-stone dark:prose-invert max-w-none',
      },
    },
  });

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

  return (
    <div className="w-full flex flex-col items-center h-full overflow-y-auto px-4 py-8">
      {/* Formatting Toolbar */}
      <WritingToolbar editor={editor} />

      {/* Editor Main Canvas Container */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`w-full flex-1 transition-all ${getFontFamilyClass(settings.fontFamily)}`}
        style={{
          maxWidth: settings.maxWidth || '760px',
          fontSize: `${settings.fontSize || 16}px`,
          lineHeight: settings.lineHeight || 1.8,
          color: 'var(--color-text-primary)',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
