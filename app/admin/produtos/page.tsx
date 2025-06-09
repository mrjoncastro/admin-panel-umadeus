"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import createPocketBase from "@/lib/pocketbase";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import PostContentEditor from "../posts/components/PostContentEditor";
import type { Produto } from "@/types";

export default function ProdutosPage() {
  const { user, isLoggedIn } = useAuthContext();
  const pb = useMemo(() => createPocketBase(), []);
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [imagens, setImagens] = useState<FileList | null>(null);
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState<string[]>([]);
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([]);
  const [descricao, setDescricao] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.replace("/admin/login");
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchProdutos() {
      try {
        const lista = await pb.collection("produtos").getFullList<Produto>({ sort: "-created" });
        setProdutos(lista);
      } catch (err) {
        console.error("Erro ao carregar produtos", err);
        showError("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    }
    fetchProdutos();
  }, [pb, user, showError]);

  const criarProduto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      const formData = new FormData();
      formData.set("nome", nome);
      formData.set("preco", preco);
      formData.set("checkout_url", checkoutUrl);
      formData.set("descricao", descricao);
      formData.set("detalhes", detalhes);
      formData.set("ativo", ativo ? "true" : "false");
      formData.set("user_org", user.id);
      tamanhosSelecionados.forEach((t) => formData.append("tamanhos", t));
      generosSelecionados.forEach((g) => formData.append("generos", g));
      if (imagens) {
        Array.from(imagens).forEach((file) => {
          formData.append("imagens", file);
        });
      }

      const res = await fetch("/admin/api/produtos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pb.authStore.token}`,
          "X-PB-User": JSON.stringify(pb.authStore.model),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Erro ao criar produto");
        return;
      }

      setProdutos((p) => [data as Produto, ...p]);
      setNome("");
      setPreco("");
      setImagens(null);
      setTamanhosSelecionados([]);
      setGenerosSelecionados([]);
      setDescricao("");
      setDetalhes("");
      setCheckoutUrl("");
      setAtivo(true);
      showSuccess("Produto criado");
    } catch (err) {
      console.error("Erro ao criar produto", err);
      showError("Erro ao criar produto");
    }
  };

  if (loading) return <p className="p-6 text-center text-sm">Carregando...</p>;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h2 className="heading">Produtos</h2>
      <form onSubmit={criarProduto} className="card space-y-4 max-w-md">
        <input
          className="input-base"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          className="input-base"
          placeholder="Preço"
          type="number"
          step="0.01"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          required
        />
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImagens(e.target.files)}
          className="input-base"
        />
        <div>
          <p className="text-sm mb-1">Tamanhos</p>
          <div className="flex gap-2 flex-wrap">
            {["PP", "P", "M", "G", "GG"].map((t) => (
              <label key={t} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  value={t}
                  checked={tamanhosSelecionados.includes(t)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setTamanhosSelecionados((prev) =>
                      checked ? [...prev, t] : prev.filter((x) => x !== t)
                    );
                  }}
                />
                {t}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm mb-1">Gêneros</p>
          <div className="flex gap-2 flex-wrap">
            {["masculino", "feminino"].map((g) => (
              <label key={g} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  value={g}
                  checked={generosSelecionados.includes(g)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setGenerosSelecionados((prev) =>
                      checked ? [...prev, g] : prev.filter((x) => x !== g)
                    );
                  }}
                />
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm mb-1">Descrição</p>
          <PostContentEditor value={descricao} onChange={setDescricao} />
        </div>
        <div>
          <p className="text-sm mb-1">Detalhes</p>
          <PostContentEditor value={detalhes} onChange={setDetalhes} />
        </div>
        <input
          className="input-base"
          placeholder="Checkout URL"
          value={checkoutUrl}
          onChange={(e) => setCheckoutUrl(e.target.value)}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
          />
          Ativo
        </label>
        <button type="submit" className="btn btn-primary w-full">Salvar</button>
      </form>

      <div className="overflow-x-auto rounded border shadow-sm">
        <table className="table-base">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">{p.nome}</td>
                <td>{Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
