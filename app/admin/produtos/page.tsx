"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import createPocketBase from "@/lib/pocketbase";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
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
  const [imagem, setImagem] = useState("");

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.replace("/admin/login");
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchProdutos() {
      try {
        const lista = await pb
          .collection("produtos")
          .getFullList<Produto>({
            sort: "-created",
            filter: `user_org = "${user.id}"`,
          });
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
    try {
      const criado = await pb.collection("produtos").create({
        nome,
        preco: parseFloat(preco),
        imagem,
        user_org: user?.id,
      });
      setProdutos((p) => [criado as Produto, ...p]);
      setNome("");
      setPreco("");
      setImagem("");
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
          className="input-base"
          placeholder="URL da imagem"
          value={imagem}
          onChange={(e) => setImagem(e.target.value)}
        />
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
