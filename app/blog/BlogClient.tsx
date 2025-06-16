"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BlogSidebar from "./components/BlogSidebar";
import BlogHeroCarousel from "./components/BlogHeroCarousel";
import Link from "next/link";
import Image from "next/image";
import createPocketBase from "@/lib/pocketbase";
import type { Cliente } from "@/types";

interface Post {
  title: string;
  date: string;
  summary: string;
  slug: string;
  thumbnail?: string | null;
  category?: string | null;
}

const POSTS_PER_PAGE = 6;

export default function BlogClient() {
  const [nomeCliente, setNomeCliente] = useState("");

  useEffect(() => {
    const pb = createPocketBase();
    async function fetchCliente() {
      try {
        const tenantId = localStorage.getItem("tenant_id");
        if (tenantId) {
          const c = await pb
            .collection("m24_clientes")
            .getOne<Cliente>(tenantId);
          setNomeCliente(c.nome ?? "");
          return;
        }
        const dominio = window.location.hostname;
        const c = await pb
          .collection("m24_clientes")
          .getFirstListItem<Cliente>(`dominio='${dominio}'`);
        localStorage.setItem("tenant_id", c.id);
        setNomeCliente(c.nome ?? "");
      } catch (err) {
        console.error("Erro ao buscar nome do cliente:", err);
      }
    }
    fetchCliente();
  }, []);

  const introText = {
    title: "Criamos este espaço porque acreditamos no poder do conhecimento.",
    paragraph: `${nomeCliente} valoriza a informação como forma de cuidado. Por isso, cada conteúdo aqui foi pensado para orientar, inspirar e caminhar ao seu lado.`,
  };

  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useSearchParams();
  const categoriaSelecionada =
    searchParams.get("categoria")?.toLowerCase() || "";

  useEffect(() => {
    fetch("/posts.json")
      .then((res) => res.json())
      .then(setPosts)
      .catch((err) => {
        console.error("Erro ao carregar posts.json:", err);
      });
  }, []);

  const filteredPosts = posts.filter((post) => {
    const texto =
      `${post.title} ${post.summary} ${post.category}`.toLowerCase();
    const correspondeBusca = texto.includes(search.toLowerCase());
    const correspondeCategoria = categoriaSelecionada
      ? post.category?.toLowerCase() === categoriaSelecionada
      : true;
    return correspondeBusca && correspondeCategoria;
  });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <BlogHeroCarousel />

      <main className="max-w-7xl mx-auto px-6 py-20 font-sans">
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            {introText.title}
          </h1>
          <p className="text-[var(--text-secondary)] text-lg mb-6">{introText.paragraph}</p>
          <div className="max-w-xl mx-auto flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar por assunto ou dúvida..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-2/3">
            {paginatedPosts.length > 0 ? (
              <>
                <div className="grid gap-10 md:grid-cols-2">
                  {paginatedPosts.map((post) => (
                    <div
                      key={post.slug}
                      className="bg-[var(--background)] dark:bg-neutral-900 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
                    >
                      {post.thumbnail && (
                        <Image
                          src={post.thumbnail}
                          alt={`Imagem de capa do post: ${post.title}`}
                          width={640}
                          height={320}
                          className="w-full h-56 object-cover"
                        />
                      )}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        {post.category && (
                          <span className="inline-block bg-primary-50 text-primary-800 text-xs font-semibold px-3 py-1 rounded-full mb-2 uppercase tracking-wide">
                            {post.category}
                          </span>
                        )}
                        <Link
                          href={`/blog/post/${post.slug}`}
                          className="hover:underline"
                        >
                          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                            {post.title}
                          </h2>
                        </Link>
                        <p className="text-sm text-neutral-500 mb-3">
                          {post.date}
                        </p>
                        <p className="text-sm text-neutral-700 mb-4 line-clamp-3">
                          {post.summary}
                        </p>
                        <Link
                          href={`/blog/post/${post.slug}`}
                          className="mt-auto inline-block text-sm text-primary-600 hover:text-primary-800 font-semibold"
                        >
                          Leia mais →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center items-center mt-12 gap-2 flex-wrap">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm rounded bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50"
                  >
                    ← Anterior
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={`page-${i + 1}`}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-2 text-sm rounded ${
                        currentPage === i + 1
                          ? "bg-primary-600 text-white"
                          : "bg-neutral-100 hover:bg-neutral-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm rounded bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50"
                  >
                    Próxima →
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-neutral-500 text-lg">
                Nenhum post encontrado com esse termo.
              </p>
            )}
          </div>

          <BlogSidebar />
        </div>
      </main>
    </>
  );
}
