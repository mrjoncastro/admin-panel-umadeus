import createPocketBase from "@/lib/pocketbase";
import ProdutosFiltrados from "./ProdutosFiltrados";

export const dynamic = "force-dynamic";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagens: string[];
  slug: string;
}

export default async function ProdutosPage() {
  const pb = createPocketBase();
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  const baseFilter = tenantId
    ? `ativo = true && cliente='${tenantId}'`
    : "ativo = true";

  const list = await pb.collection("produtos").getList<Produto>(1, 50, {
    filter: baseFilter,
    sort: "-created",
  });
  const produtosPB: Produto[] = list.items;

  const produtos = produtosPB.map((p) => ({
    ...p,
    imagens: (p.imagens || []).map((img) => pb.files.getURL(p, img)),
  }));

  return (
    <main className="max-w-7xl mx-auto px-2 md:px-6 py-8 font-sans text-[var(--text-primary)]">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Produtos</h1>
      {!tenantId && (
        <p className="mb-4 text-sm">
          Variável NEXT_PUBLIC_TENANT_ID não definida. Exibindo todos os produtos.
        </p>
      )}
      <ProdutosFiltrados produtos={produtos} />
    </main>
  );
}
