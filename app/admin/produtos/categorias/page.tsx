"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";

interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

export default function CategoriasAdminPage() {
  const { user: ctxUser, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("pb_token") : null;
  const rawUser =
    typeof window !== "undefined" ? localStorage.getItem("pb_user") : null;
  const user = rawUser ? JSON.parse(rawUser) : ctxUser;
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nome, setNome] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") {
      router.replace("/admin/login");
    }
  }, [isLoggedIn, token, user, router]);

  useEffect(() => {
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
  }, [isLoggedIn, token, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn || !user || user.role !== "coordenador") return;
    setLoading(true);
    const metodo = editId ? "PUT" : "POST";
    const url = editId ? `/admin/api/categorias/${editId}` : "/admin/api/categorias";
    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
        body: JSON.stringify({ nome }),
      });
      const data = await res.json();
      if (res.ok) {
        setNome("");
        setEditId(null);
        fetch("/admin/api/categorias", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-PB-User": JSON.stringify(user),
          },
        })
          .then((r) => r.json())
          .then((cats) => {
            setCategorias(Array.isArray(cats) ? cats : []);
          })
          .catch((err) => {
            console.error("Erro ao atualizar categorias:", err);
            setCategorias([]);
          });
      } else {
        console.error(data.error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Confirma excluir?")) return;
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
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
        Categorias
      </h2>
      <form onSubmit={handleSubmit} className="card max-w-md mb-6">
        <input
          className="input-base"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da categoria"
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
            {editId ? "Atualizar" : "Cadastrar"}
          </button>
          {editId && (
            <button type="button" className="btn flex-1" onClick={() => {setEditId(null); setNome("");}}>
              Cancelar
            </button>
          )}
        </div>
      </form>
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
                    <button className="btn" onClick={() => {setEditId(c.id); setNome(c.nome);}}>
                      Editar
                    </button>
                    <button className="btn" style={{ color: "var(--accent)" }} onClick={() => handleDelete(c.id)}>
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
