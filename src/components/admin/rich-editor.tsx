"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface RichEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

export function RichEditor({ name, defaultValue = "", placeholder = "Start writing…" }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "prose prose-neutral max-w-none min-h-[320px] focus:outline-none px-5 py-4 text-sm leading-relaxed",
      },
    },
  });

  // Sync editor HTML to hidden input on every change
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const el = document.getElementById(`${name}-input`) as HTMLInputElement | null;
      if (el) el.value = editor.getHTML();
    };
    editor.on("update", update);
    update();
    return () => { editor.off("update", update); };
  }, [editor, name]);

  const toolbar: { label: string; action: () => void; active?: boolean }[] = editor
    ? [
        { label: "B", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
        { label: "I", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
        { label: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
        { label: "H3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
        { label: "• List", action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
        { label: "1. List", action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
        { label: "❝", action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
        { label: "—", action: () => editor.chain().focus().setHorizontalRule().run() },
      ]
    : [];

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-300 focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-500">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border-b border-neutral-200 bg-neutral-50 p-2">
        {toolbar.map((t) => (
          <button
            key={t.label}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); t.action(); }}
            className="rounded px-2.5 py-1 text-xs font-semibold transition-colors"
            style={t.active
              ? { background: "#1f2937", color: "#fff" }
              : { color: "#374151" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Hidden input carries the HTML value to the form */}
      <input type="hidden" id={`${name}-input`} name={name} defaultValue={defaultValue} />
    </div>
  );
}
