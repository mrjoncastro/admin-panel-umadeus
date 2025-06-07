"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useState } from "react";
import PostContentEditor from "../../components/PostContentEditor";

export default function EditarPostPage({
  params,
}: {
  params: { slug: string };
}) {
  // Se no futuro params for uma Promise, descomente a linha abaixo:
  // const { slug } = React.use(params);

  const { slug } = params; // Para compatibilidade atual

  const [conteudo, setConteudo] = useState("");

  const { user, isLoggedIn } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.replace("/admin/login");
    }
  }, [isLoggedIn, user, router]);

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

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded"
          >
            Salvar
          </button>
        </form>
      </main>
    </>
  );
}
