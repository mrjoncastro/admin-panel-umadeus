// app/loja/categorias/[slug]/page.tsx
import Image from "next/image";
import createPocketBase from "@/lib/pocketbase";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagens: string[];
  checkout_url: string;
  categoria: string;
}

interface Params {
  slug: string;
}

export default async function CategoriaDetalhe({ params }: { params: Params }) {
  const { slug } = params;
  const pb = createPocketBase();

  const produtos: Produto[] = await pb.collection("produtos").getFullList({
    filter: `ativo = true && categoria = '${slug}'`,
    sort: "-created",
  });

  return (
    <main className="p-4 md:p-8 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-platinum">
        Categoria: {slug.charAt(0).toUpperCase() + slug.slice(1)}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {produtos.map((p) => (
          <div key={p.id} className="bg-white rounded shadow p-2">
            <div className="relative">
              <Image
                src={pb.files.getUrl(p, p.imagens[0])}
                alt={p.nome}
                width={400}
                height={400}
                className="w-full h-auto object-cover rounded"
              />
              {/* Badge opcional de promoção */}
              <div className="absolute top-0 left-0 bg-black text-white text-xs px-2 py-1">
                50% OFF
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-2">Ver Semelhantes</p>
            <h2 className="text-sm font-medium text-black mt-1 line-clamp-2">
              {p.nome}
            </h2>
            <p className="text-base font-semibold text-black_bean mt-1">
              R$ {p.preco.toFixed(2).replace(".", ",")}
            </p>

            <a
              href={p.checkout_url}
              className="block mt-3 bg-black_bean text-white text-center py-2 rounded text-sm font-bold hover:bg-black_bean/90"
            >
              Comprar agora
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
