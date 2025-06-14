"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import EditorToolbar from "./EditorToolbar";
import { useEffect } from "react";
// @ts-expect-error: turndown não possui tipos TypeScript oficiais
import TurndownService from "turndown";
import { marked } from "marked";

// Função para converter markdown em HTML para o editor
function markdownToHtml(md: string) {
  return marked.parse(md || "");
}

// Função para converter HTML do editor em markdown ao salvar
const turndownService = new TurndownService();

type Props = {
  value: string; // markdown inicial
  onChange: (markdown: string) => void;
};

export default function PostMarkdownEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: markdownToHtml(value),
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral focus:outline-none min-h-[200px] px-2 py-2 bg-white rounded-b-lg",
      },
    },
    onUpdate: ({ editor }) => {
      // Obtém HTML do editor e converte para Markdown
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
  });

  // Atualiza quando o valor externo ou o editor mudam
  useEffect(() => {
    if (editor && value) {
      const html = markdownToHtml(value);
      if (html !== editor.getHTML()) {
        editor.commands.setContent(html, false);
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
