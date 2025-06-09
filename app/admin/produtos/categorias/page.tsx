"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import ModalCategoria from "./ModalCategoria";

interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

export default function CategoriasAdminPage() {
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
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editCategoria, setEditCategoria] = useState<Categoria | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") {
      router.replace("/admin/login");
    }
  }, [isLoggedIn, router, getAuth]);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") return;
    fetch("/admin/api/categorias", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCategorias(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Erro ao carregar categorias:", err);
        setCategorias([]);
      });
  }, [isLoggedIn, getAuth]);

  async function handleSave(form: { nome: string }) {
    const { token, user } = getAuth();
    if (!isLoggedIn || !user || user.role !== "coordenador") return;
    const metodo = editCategoria ? "PUT" : "POST";
    const url = editCategoria
      ? `/admin/api/categorias/${editCategoria.id}`
      : "/admin/api/categorias";
    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        const auth = getAuth();
        fetch("/admin/api/categorias", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "X-PB-User": JSON.stringify(auth.user),
          },
        })
          .then((r) => r.json())
          .then((cats) => setCategorias(Array.isArray(cats) ? cats : []))
          .catch((err) => {
            console.error("Erro ao atualizar categorias:", err);
            setCategorias([]);
          });
      } else {
        console.error(data.error);
      }
    } finally {
      setModalOpen(false);
      setEditCategoria(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Confirma excluir?")) return;
    const { token, user } = getAuth();
    await fetch(`/admin/api/categorias/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    });
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-[var(--space-lg)]">
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Categorias
        </h2>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Nova Categoria
        </button>
      </div>
      {modalOpen && (
        <ModalCategoria
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditCategoria(null);
          }}
          onSubmit={handleSave}
          initial={editCategoria ? { nome: editCategoria.nome } : null}
        />
      )}
      <div className="overflow-x-auto rounded border shadow-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
        <table className="table-base">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Slug</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.slug}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn"
                      onClick={() => {
                        setEditCategoria(c);
                        setModalOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn"
                      style={{ color: "var(--accent)" }}
                      onClick={() => handleDelete(c.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
