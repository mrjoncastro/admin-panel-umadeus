// app/loja/categorias/[slug]/page.tsx
import createPocketBase from "@/lib/pocketbase";
import ProdutosFiltrados from "./ProdutosFiltrados";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagens: string[];
  slug: string;
  categoria: string;
}

interface Params {
  slug: string;
}

export default async function CategoriaDetalhe({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const pb = createPocketBase();

  const produtosPB: Produto[] = await pb.collection("produtos").getFullList({
    filter: `ativo = true && categoria = '${slug}'`,
    sort: "-created",
  });

  const produtos = produtosPB.map((p) => ({
    ...p,
    imagens: (p.imagens || []).map((img) => pb.files.getURL(p, img)),
  }));

  return (
    <main className="p-4 md:p-8 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-platinum">
        Categoria: {slug.charAt(0).toUpperCase() + slug.slice(1)}
      </h1>

      <ProdutosFiltrados produtos={produtos} />
    </main>
  );
}
