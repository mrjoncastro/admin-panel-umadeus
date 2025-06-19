"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import LoadingOverlay from "@/components/LoadingOverlay";
import type { Produto } from "@/types";
import { ModalProduto } from "../../../produtos/novo/ModalProduto";
import { useToast } from "@/lib/context/ToastContext";

export default function EditarEventoPage() {
  const { id } = useParams<{ id: string }>();
  const { user: ctxUser, isLoggedIn } = useAuthContext();
  const { showSuccess, showError } = useToast();
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
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cobraInscricao, setCobraInscricao] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedProdutos, setSelectedProdutos] = useState<string[]>([]);
  const [produtoModalOpen, setProdutoModalOpen] = useState(false);

  function toggleProduto(id: string) {
    setSelectedProdutos((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

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
        setExistingImage(data.imagem || null);
        setCobraInscricao(Boolean(data.cobra_inscricao));
        const arr = Array.isArray(data.produtos)
          ? (data.produtos as string[])
          : data.produto_inscricao
          ? [data.produto_inscricao as string]
          : [];
        setSelectedProdutos(arr);
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
      setSelectedProdutos((prev) => [...prev, data.id]);
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
    const imagemInput = formElement.querySelector<HTMLInputElement>(
      "input[name='imagem']"
    );
    const files = imagemInput?.files;
    formData.delete("imagem");
    if (files && files.length > 0) {
      formData.append("imagem", files[0]);
    } else if (existingImage) {
      formData.append("imagem", existingImage);
    }
    formData.delete("produtos");
    selectedProdutos.forEach((p) => formData.append("produtos", p));
    formData.set("cobra_inscricao", String(cobraInscricao));
    const { token, user } = getAuth();
    try {
      const res = await fetch(`/admin/api/eventos/${id}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
      });
      if (res.ok) {
        showSuccess("Evento salvo com sucesso");
        router.push("/admin/eventos");
      } else {
        showError("Falha ao salvar evento");
      }
    } catch (err) {
      console.error("Erro ao salvar evento:", err);
      showError("Falha ao salvar evento");
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
            <label className="label-base">Produtos para inscrição</label>
            <div className="flex flex-col gap-2">
              {produtos.map((p) => (
                <label className="checkbox-label" key={p.id}>
                  <input
                    type="checkbox"
                    name="produtos"
                    value={p.id}
                    checked={selectedProdutos.includes(p.id)}
                    onChange={() => toggleProduto(p.id)}
                    className="checkbox-base"
                  />
                  {p.nome}
                </label>
              ))}
              <button
                type="button"
                className="btn btn-secondary w-fit"
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
