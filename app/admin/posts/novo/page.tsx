"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function NovoPostPage() {
  const { user, isLoggedIn } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.replace("/admin/login");
    }
  }, [isLoggedIn, user, router]);

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Novo Post</h1>
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
        <textarea
          placeholder="Conteúdo MDX"
          className="w-full border p-2 rounded h-40"
        ></textarea>
        <button type="submit" className="w-full bg-red-600 text-white py-2 rounded">
          Salvar
        </button>
      </form>
    </main>
  );
}
