"use client";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

const btn =
  "rounded border border-[var(--line)] px-2 py-1 text-xs hover:border-acc data-[on=true]:bg-acc data-[on=true]:text-on-acc";

export function RichEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (json: unknown) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: (value as object) ?? { type: "doc", content: [] },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-40 rounded border border-[var(--line)] bg-[var(--bg2)] p-3 focus:outline-none",
        "aria-label": "Éditeur de contenu",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  // Keep external value in sync if it changes (e.g. revision restore).
  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    if (JSON.stringify(value) !== current) {
      editor.commands.setContent((value as object) ?? { type: "doc", content: [] });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1" role="toolbar" aria-label="Mise en forme">
        <button
          type="button"
          className={btn}
          data-on={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Gras
        </button>
        <button
          type="button"
          className={btn}
          data-on={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italique
        </button>
        <button
          type="button"
          className={btn}
          data-on={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          Titre
        </button>
        <button
          type="button"
          className={btn}
          data-on={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Liste
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
