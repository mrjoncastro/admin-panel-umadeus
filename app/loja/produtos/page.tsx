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

  // Simulação de filtros estáticos, substitua por lógica dinâmica conforme necessidade
  const faixasPreco = [
    { label: "Até R$ 50", min: 0, max: 50 },
    { label: "R$ 50 a R$ 100", min: 50, max: 100 },
    { label: "Acima de R$ 100", min: 100, max: Infinity },
  ];

  return (
    <main className="max-w-7xl mx-auto px-2 md:px-6 py-8 font-sans text-[var(--text-primary)]">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Produtos</h1>
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 rounded-2xl bg-white/80 shadow-lg p-6 h-fit border border-[var(--accent-900)]/10">
          <h2 className="text-lg font-semibold mb-4">Filtrar</h2>
          {/* Busca */}
          <div className="mb-6">
            <label className="block mb-2 text-sm">Buscar produto</label>
            <input
              type="text"
              placeholder="Digite o nome"
              className="input-base"
              disabled
            />
          </div>
          {/* Filtros de preço */}
          <div className="mb-6">
            <label className="block mb-2 text-sm">Preço</label>
            <div className="space-y-2">
              {faixasPreco.map((faixa) => (
                <div key={faixa.label} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-[var(--accent)]"
                    disabled
                  />
                  <span className="text-sm">{faixa.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Ordem */}
          <div>
            <label className="block mb-2 text-sm">Ordenar por</label>
            <select className="input-base" disabled>
              <option value="recentes">Mais recentes</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
            </select>
          </div>
        </aside>

        {/* Grid de Produtos */}
        <section className="flex-1">
          {/* Filtros mobile */}
          <div className="md:hidden mb-4 flex gap-2">
            <button className="btn btn-secondary">Filtrar</button>
            {/* Implemente off-canvas para filtros mobile se quiser depois */}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtos.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-lg border border-[var(--accent-900)]/10 flex flex-col items-center p-4 transition hover:shadow-xl"
              >
                <div className="w-full aspect-square flex items-center justify-center overflow-hidden rounded-xl mb-2 bg-neutral-100 border border-[var(--accent)]/5">
                  <Image
                    src={p.imagens[0]}
                    alt={p.nome}
                    width={300}
                    height={300}
                    className="object-cover w-[90%] h-[90%] transition group-hover:scale-105"
                    style={{ objectPosition: "center" }}
                  />
                </div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1 line-clamp-2 text-center">
                  {p.nome}
                </h2>
                <p className="text-base font-bold text-[var(--accent-900)] mb-2">
                  R$ {p.preco.toFixed(2).replace(".", ",")}
                </p>
                <a
                  href={`/loja/produtos/${p.slug}`}
                  className="btn btn-primary w-full text-center mt-auto"
                >
                  Ver detalhes
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
