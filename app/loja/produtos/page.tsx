import createPocketBase from "@/lib/pocketbase";
import ProdutosFiltrados from "./ProdutosFiltrados";
import { getTenantFromHost } from "@/lib/getTenantFromHost";
import { calculateGross } from "@/lib/asaasFees";

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
  const tenantId = await getTenantFromHost();
  const list = await pb.collection("produtos").getList<Produto>(1, 50, {
    filter: `ativo = true && cliente='${tenantId}'`,
    sort: "-created",
  });
  const produtosPB: Produto[] = list.items;

  const produtos = produtosPB.map((p) => ({
    ...p,
    preco: calculateGross(p.preco, "pix", 1).gross,
    imagens: (p.imagens || []).map((img) => pb.files.getURL(p, img)),
  }));

  return (
    <main className="max-w-7xl mx-auto px-2 md:px-6 py-8 font-sans text-[var(--text-primary)]">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Produtos</h1>
      <ProdutosFiltrados produtos={produtos} />
    </main>
  );
}
