"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import Link from "next/link";

interface Post {
  title: string;
  slug: string;
  date: string;
  category?: string | null;
}

const POSTS_PER_PAGE = 10;

export default function AdminPostsPage() {
  const { user, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.replace("/admin/login");
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    fetch("/posts.json")
      .then((res) => res.json())
      .then(setPosts)
      .catch((err) => {
        console.error("Erro ao carregar posts:", err);
      });
  }, []);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginated = posts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Posts</h2>
        <Link
          href="/admin/posts/novo"
          className="btn btn-primary bg-red-600 hover:bg-red-700"
        >
          + Novo Post
        </Link>
      </div>

      <div className="overflow-x-auto rounded border border-gray-200 shadow-sm">
        <table className="table-base">
          <thead>
            <tr>
              <th>Título</th>
              <th>Data</th>
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((post) => (
              <tr key={post.slug}>
                <td className="font-medium">{post.title}</td>
                <td>{post.date}</td>
                <td>{post.category || "—"}</td>
                <td>
                  <Link
                    href={`/admin/posts/editar/${post.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          className="btn btn-secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Anterior
        </button>
        <span className="text-sm">
          Página {page} de {totalPages}
        </span>
        <button
          className="btn btn-secondary"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Próxima
        </button>
      </div>
    </main>
  );
}
