"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { marked } from "marked";
import PostContentEditor from "../../components/PostContentEditor";

export default function EditarPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const [conteudo, setConteudo] = useState("");
  const [preview, setPreview] = useState(false);

  const { user, isLoggedIn } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.replace("/admin/login");
    }
  }, [isLoggedIn, user, router]);

  if (preview) {
    return (
      <main className="max-w-[680px] mx-auto px-4 py-8 bg-white">
        <button
          onClick={() => setPreview(false)}
          className="mb-4 rounded bg-neutral-200 px-3 py-2"
        >
          Editar
        </button>
        <article
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: marked.parse(conteudo) }}
        />
      </main>
    );
  }

  return (
    <>
      <div>Editando post: {slug}</div>
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Editar Post</h1>
        <p className="text-sm text-gray-600 mb-4">Slug: {slug}</p>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Título"
            className="w-full border p-2 rounded"
          />
          <input type="date" className="w-full border p-2 rounded" />
          <input
            type="text"
            placeholder="Categoria"
            className="w-full border p-2 rounded"
          />
          <PostContentEditor value={conteudo} onChange={setConteudo} />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="flex-1 bg-neutral-200 py-2 rounded"
            >
              Pré-visualizar
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-2 rounded"
            >
              Salvar
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

