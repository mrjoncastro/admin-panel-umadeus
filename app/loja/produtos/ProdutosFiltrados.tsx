"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagens: string[];
  slug: string;
}

export default function ProdutosFiltrados({ produtos }: { produtos: Produto[] }) {
  const [busca, setBusca] = useState("");
  const [faixasSelecionadas, setFaixasSelecionadas] = useState<string[]>([]);
  const [ordem, setOrdem] = useState("recentes");

  const faixasPreco = [
    { label: "Até R$ 50", min: 0, max: 50 },
    { label: "R$ 50 a R$ 100", min: 50, max: 100 },
    { label: "Acima de R$ 100", min: 100, max: Infinity },
  ];

  const filtrados = useMemo(() => {
    let res = produtos.filter((p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase())
    );
    if (faixasSelecionadas.length > 0) {
      res = res.filter((p) =>
        faixasSelecionadas.some((label) => {
          const faixa = faixasPreco.find((f) => f.label === label);
          return faixa ? p.preco >= faixa.min && p.preco <= faixa.max : true;
        })
      );
    }
    if (ordem === "menor-preco") {
      res = [...res].sort((a, b) => a.preco - b.preco);
    } else if (ordem === "maior-preco") {
      res = [...res].sort((a, b) => b.preco - a.preco);
    }
    return res;
  }, [busca, faixasSelecionadas, ordem, produtos]);

  function toggleFaixa(label: string) {
    setFaixasSelecionadas((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  }

  return (
    <div className="flex gap-8">
      <aside className="hidden md:block w-64 shrink-0 rounded-2xl bg-white/80 shadow-lg p-6 h-fit border border-[var(--accent-900)]/10">
        <h2 className="text-lg font-semibold mb-4">Filtrar</h2>
        <div className="mb-6">
          <label className="block mb-2 text-sm">Buscar produto</label>
          <input
            type="text"
            placeholder="Digite o nome"
            className="input-base"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm">Preço</label>
          <div className="space-y-2">
            {faixasPreco.map((faixa) => (
              <div key={faixa.label} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-[var(--accent)]"
                  checked={faixasSelecionadas.includes(faixa.label)}
                  onChange={() => toggleFaixa(faixa.label)}
                />
                <span className="text-sm">{faixa.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm">Ordenar por</label>
          <select
            className="input-base"
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
          >
            <option value="recentes">Mais recentes</option>
            <option value="menor-preco">Menor preço</option>
            <option value="maior-preco">Maior preço</option>
          </select>
        </div>
      </aside>

      <section className="flex-1">
        <div className="md:hidden mb-4 flex gap-2">
          <button className="btn btn-secondary">Filtrar</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtrados.map((p) => (
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
              <Link
                href={`/loja/produtos/${p.slug}`}
                className="btn btn-primary w-full text-center mt-auto"
              >
                Ver detalhes
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
