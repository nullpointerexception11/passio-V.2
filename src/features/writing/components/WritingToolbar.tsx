/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
} from 'lucide-react';

interface WritingToolbarProps {
  editor: Editor | null;
}

export const WritingToolbar: React.FC<WritingToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div
      className="sticky top-2 z-30 flex items-center gap-1 p-1.5 rounded-2xl border mb-6 self-center select-none backdrop-blur-md shadow-md transition-all"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
          editor.isActive('bold')
            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'
            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
        }`}
        title="Kalın (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
          editor.isActive('italic')
            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
        }`}
        title="Yatık (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-current opacity-10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'
            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
        }`}
        title="Başlık 1"
      >
        <Heading1 className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'
            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
        }`}
        title="Başlık 2"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-current opacity-10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
          editor.isActive('bulletList')
            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
        }`}
        title="Maddeli Liste"
      >
        <List className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
          editor.isActive('orderedList')
            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
        }`}
        title="Numaralı Liste"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
          editor.isActive('blockquote')
            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
        }`}
        title="Alıntı Blok"
      >
        <Quote className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
          editor.isActive('codeBlock')
            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
        }`}
        title="Kod Bloğu"
      >
        <Code className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-current opacity-10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded-lg text-xs hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 disabled:opacity-20 cursor-pointer"
        title="Geri Al (Ctrl+Z)"
      >
        <Undo className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded-lg text-xs hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 disabled:opacity-20 cursor-pointer"
        title="Yinele (Ctrl+Y)"
      >
        <Redo className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
