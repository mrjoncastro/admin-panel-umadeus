import Image from "next/image";
import Link from "next/link";
import createPocketBase from "@/lib/pocketbase";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagens: string[];
  slug: string;
  categoria: string;
}

export default async function ProdutosPage() {
  const pb = createPocketBase();
  const produtos: Produto[] = await pb
    .collection("produtos")
    .getFullList({ filter: "ativo = true", sort: "-created" });

  const agrupados = produtos.reduce<Record<string, Produto[]>>((acc, p) => {
    const cat = p.categoria || "outros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  const categorias = Object.keys(agrupados);

  return (
    <main className="p-4 md:p-8 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-platinum">
        Produtos
      </h1>
      {categorias.map((cat) => (
        <section key={cat} className="mb-10">
          <h2 className="text-xl font-semibold mb-4">
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {agrupados[cat].map((p) => (
              <Link
                key={p.id}
                href={`/loja/produtos/${p.slug}`}
                className="bg-white rounded shadow p-2 block"
              >
                <Image
                  src={pb.files.getUrl(p, p.imagens[0])}
                  alt={p.nome}
                  width={400}
                  height={400}
                  className="w-full h-auto object-cover rounded"
                />
                <h3 className="text-sm font-medium text-black mt-2 line-clamp-2">
                  {p.nome}
                </h3>
                <p className="text-base font-semibold text-black_bean mt-1">
                  R$ {p.preco.toFixed(2).replace(".", ",")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
