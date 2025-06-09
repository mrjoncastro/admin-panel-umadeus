import Image from "next/image";
import createPocketBase from "@/lib/pocketbase";

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
    <main className="p-4 md:p-8 font-sans text-platinum">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Produtos</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {produtos.map((p) => (
          <div key={p.id} className="bg-white rounded shadow p-2">
            <Image
              src={p.imagens[0]}
              alt={p.nome}
              width={400}
              height={400}
              className="w-full h-auto object-cover rounded"
            />
            <h2 className="text-sm font-medium text-black mt-1 line-clamp-2">
              {p.nome}
            </h2>
            <p className="text-base font-semibold text-black_bean mt-1">
              R$ {p.preco.toFixed(2).replace('.', ',')}
            </p>
            <a
              href={`/loja/produtos/${p.slug}`}
              className="block mt-3 btn btn-primary text-center"
            >
              Ver detalhes
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
