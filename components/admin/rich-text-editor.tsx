// components/admin/rich-text-editor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-32 px-3 py-2 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <div className="h-40 w-full animate-pulse rounded-md bg-muted" />;
  }

  const ToolbarButton = ({ onClick, isActive, children }: { onClick: () => void; isActive: boolean; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} className={cn('rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent', isActive && 'bg-accent text-primaryBlack dark:text-primaryWhite')}>
      {children}
    </button>
  );

  return (
    <div className="rounded-md border border-input bg-background shadow-sm">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
          <ListOrdered size={14} />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}
