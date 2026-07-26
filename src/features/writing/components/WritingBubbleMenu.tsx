/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Editor } from '@tiptap/core';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote } from 'lucide-react';

interface WritingBubbleMenuProps {
  editor: Editor | null;
}

export const WritingBubbleMenu: React.FC<WritingBubbleMenuProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      options={{ offset: 8, placement: 'top' }}
      className="flex items-center gap-1 p-1 rounded-xl shadow-2xl border backdrop-blur-md select-none"
      style={{
        backgroundColor: 'var(--color-bg-surface, #18181b)',
        borderColor: 'var(--color-border-subtle, #3f3f46)',
        color: 'var(--color-text-primary, #ffffff)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      }}
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center ${
          editor.isActive('bold')
            ? 'bg-amber-500/20 text-amber-500 font-bold'
            : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
        }`}
        title="Kalın (Bold)"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center ${
          editor.isActive('italic')
            ? 'bg-amber-500/20 text-amber-500 font-bold'
            : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
        }`}
        title="İtalik (Italic)"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-neutral-700/60 mx-0.5" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-amber-500/20 text-amber-500 font-bold'
            : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
        }`}
        title="Başlık 1"
      >
        <Heading1 className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-amber-500/20 text-amber-500 font-bold'
            : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
        }`}
        title="Başlık 2"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-neutral-700/60 mx-0.5" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center ${
          editor.isActive('bulletList')
            ? 'bg-amber-500/20 text-amber-500 font-bold'
            : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
        }`}
        title="Madde İşaretli Liste"
      >
        <List className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center ${
          editor.isActive('orderedList')
            ? 'bg-amber-500/20 text-amber-500 font-bold'
            : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
        }`}
        title="Numaralı Liste"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center ${
          editor.isActive('blockquote')
            ? 'bg-amber-500/20 text-amber-500 font-bold'
            : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
        }`}
        title="Alıntı (Blockquote)"
      >
        <Quote className="w-3.5 h-3.5" />
      </button>
    </BubbleMenu>
  );
};

export default WritingBubbleMenu;
