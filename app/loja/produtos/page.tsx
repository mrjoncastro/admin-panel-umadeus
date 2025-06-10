import createPocketBase from "@/lib/pocketbase";
import ProdutosFiltrados from "./ProdutosFiltrados";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagens: string[];
  slug: string;
}

export default async function ProdutosPage() {
  const pb = createPocketBase();
  const produtosPB: Produto[] = await pb.collection("produtos").getFullList({
    filter: "ativo = true",
    sort: "-created",
  });

  const produtos = produtosPB.map((p) => ({
    ...p,
    imagens: (p.imagens || []).map((img) => pb.files.getURL(p, img)),
  }));

  return (
    <main className="max-w-7xl mx-auto px-2 md:px-6 py-8 font-sans text-[var(--text-primary)]">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Produtos</h1>
      <ProdutosFiltrados produtos={produtos} />
    </main>
  );
}
