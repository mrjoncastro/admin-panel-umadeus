"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import EditorToolbar from "./EditorToolbar";
import { useEffect } from "react";

type Props = {
  /** HTML inicial do editor */
  value: string;
  /** Dispara sempre que o HTML é atualizado */
  onChange: (html: string) => void;
};

export default function PostMarkdownEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral focus:outline-none min-h-[200px] px-2 py-2 bg-white rounded-b-lg",
      },
    },
    onUpdate: ({ editor }) => {
      // Retorna o HTML do editor sempre que atualizado
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Atualiza quando o valor externo ou o editor mudam
  useEffect(() => {
    if (editor && value) {
      if (value !== editor.getHTML()) {
        editor.commands.setContent(value, false);
      }
    }
  }, [value, editor]);

  return (
    <div className="bg-white rounded-xl shadow">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
