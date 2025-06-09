import Image from "next/image";
import Link from "next/link";
import createPocketBase from "@/lib/pocketbase";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagens: string[];
  checkout_url: string;
  slug: string;
  descricao?: string;
}

interface Params {
  slug: string;
}

export default async function ProdutoDetalhe({ params }: { params: Params }) {
  const pb = createPocketBase();
  const produto = await pb
    .collection("produtos")
    .getFirstListItem<Produto>(`slug = '${params.slug}'`);

  return (
    <main className="font-sans px-4 md:px-16 py-10">
      <Link
        href="/loja/produtos"
        className="text-sm text-platinum hover:text-[var(--primary-600)] mb-6 inline-block transition"
      >
        &lt; voltar
      </Link>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <Image
            src={pb.files.getUrl(produto, produto.imagens[0])}
            alt={produto.nome}
            width={600}
            height={600}
            className="w-full rounded-xl border border-black_bean shadow-lg"
          />
        </div>

        <div className="space-y-6">
          <h1 className="font-bebas text-[var(--primary-600)] text-3xl md:text-4xl font-bold leading-tight">
            {produto.nome}
          </h1>
          <p className="text-xl font-semibold text-platinum">
            R$ {produto.preco.toFixed(2).replace(".", ",")}
          </p>

          <a
            href={produto.checkout_url}
            className="block w-full bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-white text-center py-3 rounded-full font-semibold transition text-lg"
          >
            Comprar agora
          </a>

          {produto.descricao && (
            <p className="text-sm text-platinum mt-4 whitespace-pre-line">
              {produto.descricao}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
