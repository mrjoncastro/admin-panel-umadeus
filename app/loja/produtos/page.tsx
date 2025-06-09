import Image from "next/image";
import Link from "next/link";
import createPocketBase from "@/lib/pocketbase";
import AddToCartButton from "./AddToCartButton";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagens: string[];
  checkout_url: string;
  slug: string;
  descricao?: string;
  cores?: string | string[]; // aceita ambos para facilitar o parsing
}

interface Params {
  slug: string;
}

export default async function ProdutoDetalhe({ params }: { params: Params }) {
  const pb = createPocketBase();

  let produto: Produto | null = null;
  try {
    produto = await pb
      .collection("produtos")
      .getFirstListItem<Produto>(`slug = '${params.slug}'`);
  } catch (err) {
    console.error(err);
    return (
      <main className="font-sans px-4 md:px-16 py-10">
        <Link
          href="/loja/produtos"
          className="text-sm text-platinum hover:text-[var(--primary-600)] mb-6 inline-block transition"
        >
          &lt; voltar
        </Link>
        <div className="text-center text-red-500 text-lg mt-10">
          Produto não encontrado ou ocorreu um erro.
        </div>
      </main>
    );
  }

  // Converte cores para array
  const coresArray: string[] = Array.isArray(produto.cores)
    ? produto.cores
    : produto.cores
    ? produto.cores
        .split(",")
        .map((cor) => cor.trim())
        .filter(Boolean)
    : [];

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
          {(() => {
            const img = produto.imagens?.[0] ?? produto.imagem;
            return img ? (
              <Image
                src={pb.files.getURL(produto, img)}
                alt={produto.nome}
                width={600}
                height={600}
                className="w-full rounded-xl border border-black_bean shadow-lg"
              />
            ) : null;
          })()}

          {/* Mostra as variações de cor */}
          {coresArray.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="text-xs text-gray-600 mr-2">
                Cores disponíveis:
              </span>
              {coresArray.map((cor) => (
                <span
                  key={cor}
                  title={cor}
                  className="inline-block w-7 h-7 rounded-full border-2 border-white shadow"
                  style={{ background: cor, borderColor: "#e0e0e0" }}
                />
              ))}
            </div>
          )}
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
          {/* Aqui garante que AddToCartButton sempre recebe cores como array */}
          <AddToCartButton produto={{ ...produto, cores: coresArray }} />

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
