"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import LoadingOverlay from "@/components/LoadingOverlay";
import type { Produto } from "@/types";
import { ModalProduto } from "../../../produtos/novo/ModalProduto";

export default function EditarEventoPage() {
  const { id } = useParams<{ id: string }>();
  const { user: ctxUser, isLoggedIn } = useAuthContext();
  const getAuth = useCallback(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("pb_token") : null;
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("pb_user") : null;
    const user = raw ? JSON.parse(raw) : ctxUser;
    return { token, user } as const;
  }, [ctxUser]);
  const router = useRouter();
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [cobraInscricao, setCobraInscricao] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedProduto, setSelectedProduto] = useState("");
  const [produtoModalOpen, setProdutoModalOpen] = useState(false);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") {
      router.replace("/login");
    }
  }, [isLoggedIn, router, getAuth]);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") return;
    fetch(`/admin/api/eventos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setInitial({
          titulo: data.titulo,
          descricao: data.descricao,
          data: data.data,
          cidade: data.cidade,
          status: data.status,
        });
        setCobraInscricao(Boolean(data.cobra_inscricao));
        setSelectedProduto(data.produto_inscricao || "");
      })
      .finally(() => setLoading(false));
  }, [id, isLoggedIn, getAuth]);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") return;
    fetch("/admin/api/produtos", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setProdutos(Array.isArray(data) ? data : data.items ?? []);
      })
      .catch(() => setProdutos([]));
  }, [isLoggedIn, getAuth]);

  async function handleNovoProduto(form: Produto) {
    const formData = new FormData();
    formData.set("nome", String(form.nome ?? ""));
    formData.set("preco", String(form.preco ?? 0));
    if (form.checkout_url)
      formData.set("checkout_url", String(form.checkout_url));
    if (form.categoria) formData.set("categoria", String(form.categoria));
    if (Array.isArray(form.tamanhos)) {
      form.tamanhos.forEach((t) => formData.append("tamanhos", t));
    }
    if (Array.isArray(form.generos)) {
      form.generos.forEach((g) => formData.append("generos", g));
    }
    if (form.descricao) formData.set("descricao", String(form.descricao));
    if (form.detalhes) formData.set("detalhes", String(form.detalhes));
    if (Array.isArray(form.cores)) {
      formData.set("cores", (form.cores as string[]).join(","));
    } else if (form.cores) {
      formData.set("cores", String(form.cores));
    }
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
      if (!res.ok) return;
      const data = await res.json();
      setProdutos((prev) => [data, ...prev]);
      setSelectedProduto(data.id);
    } catch (err) {
      console.error("Erro ao criar produto:", err);
    } finally {
      setProdutoModalOpen(false);
    }
  }

  if (loading || !initial) {
    return <LoadingOverlay show={true} text="Carregando..." />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formElement);
    formData.set("cobra_inscricao", cobraInscricao ? "true" : "false");
    if (cobraInscricao && selectedProduto) {
      formData.set("produto_inscricao", selectedProduto);
    } else {
      formData.delete("produto_inscricao");
    }
    const { token, user } = getAuth();
    const res = await fetch(`/admin/api/eventos/${id}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    });
    if (res.ok) {
      router.push("/admin/eventos");
    }
  }

  return (
    <>
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
        Editar Evento
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input-base"
          name="titulo"
          defaultValue={String(initial.titulo)}
          maxLength={30}
          required
        />
        <textarea
          className="input-base"
          name="descricao"
          rows={2}
          defaultValue={String(initial.descricao)}
          maxLength={150}
          required
        />
        <input className="input-base" name="data" type="date" defaultValue={String(initial.data)} required />
        <input className="input-base" name="cidade" defaultValue={String(initial.cidade)} required />
        <input type="file" name="imagem" accept="image/*" className="input-base" />
        <select name="status" defaultValue={String(initial.status)} className="input-base" required>
          <option value="em breve">Em breve</option>
          <option value="realizado">Realizado</option>
        </select>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="cobra_inscricao"
            id="cobra_inscricao"
            className="checkbox-base"
            checked={cobraInscricao}
            onChange={(e) => setCobraInscricao(e.target.checked)}
          />
          <label htmlFor="cobra_inscricao" className="text-sm font-medium">
            Realizar cobrança?
          </label>
        </div>
        {cobraInscricao && (
          <div>
            <label className="label-base">Produto para inscrição</label>
            <div className="flex gap-2">
              <select
                name="produto_inscricao"
                value={selectedProduto}
                onChange={(e) => setSelectedProduto(e.target.value)}
                className="input-base flex-1"
              >
                <option value="">Selecione o produto</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-secondary whitespace-nowrap"
                onClick={() => setProdutoModalOpen(true)}
              >
                + Produto
              </button>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1">
            Salvar
          </button>
          <button type="button" onClick={() => router.push("/admin/eventos")} className="btn flex-1">
            Cancelar
          </button>
        </div>
      </form>
    </main>
    {produtoModalOpen && (
      <ModalProduto
        open={produtoModalOpen}
        onClose={() => setProdutoModalOpen(false)}
        onSubmit={handleNovoProduto}
      />
    )}
    </>
  );
}
