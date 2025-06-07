"use client";

import type { Editor } from "@tiptap/react";
import { Bold, Italic, Heading1 } from "lucide-react";

type Props = {
  editor: Editor | null;
};

export default function EditorToolbar({ editor }: Props) {
  if (!editor) {
    return null;
  }

  const btnBase =
    "btn px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700";
  const activeBg = "bg-neutral-200 dark:bg-neutral-700";

  return (
    <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700 rounded-t-lg p-2 bg-neutral-50 dark:bg-neutral-800">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${btnBase} ${editor.isActive("bold") ? activeBg : ""}`}
        aria-label="Negrito"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${btnBase} ${editor.isActive("italic") ? activeBg : ""}`}
        aria-label="It\u00e1lico"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${btnBase} ${editor.isActive("heading", { level: 2 }) ? activeBg : ""}`}
        aria-label="T\u00edtulo"
      >
        <Heading1 size={16} />
      </button>
    </div>
  );
}
