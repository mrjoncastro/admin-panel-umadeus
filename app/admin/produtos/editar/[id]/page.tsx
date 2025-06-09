"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";

interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

export default function EditarProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("pb_token") : null;

  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== "coordenador") {
      router.replace("/admin/login");
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== "coordenador") return;
    fetch("/admin/api/categorias", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setCategorias(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    fetch(`/admin/api/produtos/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
      })
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setInitial({
          nome: data.nome,
          preco: data.preco,
          descricao: data.descricao,
          detalhes: data.detalhes,
          checkoutUrl: data.checkout_url,
          tamanhos: data.tamanhos,
          generos: data.generos,
          categoria: data.categoria,
          ativo: data.ativo,
        });
      })
      .finally(() => setLoading(false));
  }, [id, isLoggedIn, user, router, token]);

  if (loading || !initial) {
    return <p className="p-4">Carregando...</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formElement);
    const res = await fetch(`/admin/api/produtos/${id}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    });
    if (res.ok) {
      router.push("/admin/produtos");
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
        Editar Produto
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input-base" name="nome" defaultValue={String(initial.nome)} required />
        <input className="input-base" name="preco" type="number" step="0.01" defaultValue={String(initial.preco)} required />
        <input className="input-base" name="checkoutUrl" type="url" defaultValue={String(initial.checkoutUrl || "")} />
        <select name="categoria" defaultValue={String(initial.categoria || "")} className="input-base">
          <option value="">Selecione a categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.nome}
            </option>
          ))}
        </select>
        <input type="file" name="imagens" multiple accept="image/*" className="input-base" />
        <div>
          <p className="text-sm font-semibold mb-1">Tamanhos</p>
          <div className="flex gap-2 flex-wrap">
            {["PP", "P", "M", "G", "GG"].map((t) => (
              <label key={t} className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="tamanhos" value={t} defaultChecked={(initial.tamanhos as string[] | undefined)?.includes(t)} />
                {t}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold mb-1">Gêneros</p>
          <div className="flex gap-2 flex-wrap">
            {["masculino", "feminino"].map((g) => (
              <label key={g} className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="generos" value={g} defaultChecked={(initial.generos as string[] | undefined)?.includes(g)} />
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <textarea className="input-base" name="descricao" rows={2} defaultValue={String(initial.descricao || "")} required />
        <textarea className="input-base" name="detalhes" rows={2} defaultValue={String(initial.detalhes || "")} />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="ativo" defaultChecked={Boolean(initial.ativo)} /> Produto ativo
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1">
            Salvar
          </button>
          <button type="button" onClick={() => router.push("/admin/produtos")} className="btn flex-1">
            Cancelar
          </button>
        </div>
      </form>
    </main>
  );
}
