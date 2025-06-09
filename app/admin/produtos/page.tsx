"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import Link from "next/link";
import type { Produto } from "@/types";
import { ModalProduto } from "./novo/ModalProduto";

const PRODUTOS_POR_PAGINA = 10;

export default function AdminProdutosPage() {
  const { user: ctxUser, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const getAuth = useCallback(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("pb_token") : null;
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("pb_user") : null;
    const user = raw ? JSON.parse(raw) : ctxUser;
    return { token, user } as const;
  }, [ctxUser]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") {
      router.replace("/admin/login");
    }
  }, [isLoggedIn, router, getAuth]);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") return;

    async function fetchProdutos() {
      try {
        const res = await fetch("/admin/api/produtos", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-PB-User": JSON.stringify(user),
          },
        });
        const data = await res.json();
        setProdutos(Array.isArray(data) ? data : data.items ?? []);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      }
    }
    fetchProdutos();
  }, [isLoggedIn, getAuth]);

  const totalPages = Math.ceil(produtos.length / PRODUTOS_POR_PAGINA);
  const paginated = produtos.slice(
    (page - 1) * PRODUTOS_POR_PAGINA,
    page * PRODUTOS_POR_PAGINA
  );

  // Função para adicionar produto na lista após cadastro via modal
  const handleNovoProduto = async (form: Produto) => {
    const formData = new FormData();
    formData.set("nome", String(form.nome ?? ""));
    formData.set("preco", String(form.preco ?? 0));
    if (form.checkoutUrl) formData.set("checkoutUrl", String(form.checkoutUrl));
    if (form.categoria) formData.set("categoria", String(form.categoria));
    if (Array.isArray(form.tamanhos))
      form.tamanhos.forEach((t) => formData.append("tamanhos", t));
    if (Array.isArray(form.generos))
      form.generos.forEach((g) => formData.append("generos", g));
    if (form.descricao) formData.set("descricao", String(form.descricao));
    if (form.detalhes) formData.set("detalhes", String(form.detalhes));
    formData.set("ativo", String(form.ativo ? "true" : "false"));
    if (form.imagens && form.imagens instanceof FileList) {
      Array.from(form.imagens).forEach((file) =>
        formData.append("imagens", file)
      );
    }

    const { token, user } = getAuth();
    try {
      const res = await fetch("/admin/api/produtos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Falha ao criar produto", res.status, data);
        return;
      }
      const data = await res.json();
      console.log("Produto criado:", data);
      setProdutos((prev) => [data, ...prev]);
    } catch (err) {
      console.error("Erro ao criar produto:", err);
    }

    setModalOpen(false);
    setPage(1);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-[var(--space-lg)]">
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Produtos
        </h2>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Novo Produto
        </button>
      </div>

      <nav className="mb-6 border-b border-neutral-200 dark:border-neutral-700 flex gap-4">
        <Link
          href="/admin/produtos"
          className={`pb-2 ${
            pathname === "/admin/produtos"
              ? "border-b-2 border-[var(--accent)]"
              : "hover:text-[var(--accent)]"
          }`}
        >
          Produtos
        </Link>
        <Link
          href="/admin/produtos/categorias"
          className={`pb-2 ${
            pathname === "/admin/produtos/categorias"
              ? "border-b-2 border-[var(--accent)]"
              : "hover:text-[var(--accent)]"
          }`}
        >
          Categorias
        </Link>
      </nav>

      {/* O modal fica aqui, fora do cabeçalho. Só é aberto se modalOpen=true */}
      {modalOpen && (
        <ModalProduto<Produto>
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleNovoProduto}
        />
      )}

      <div className="overflow-x-auto rounded border shadow-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
        <table className="table-base">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-neutral-400">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            ) : (
              paginated.map((produto) => (
                <tr key={produto.id}>
                  <td className="font-medium">{produto.nome}</td>
                  <td>
                    {Number(produto.preco).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td>
                    {produto.ativo ? (
                      <span className="text-green-600 font-semibold">
                        Ativo
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/admin/produtos/editar/${produto.id}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-[var(--space-md)] mt-[var(--space-lg)]">
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
      )}
    </main>
  );
}
