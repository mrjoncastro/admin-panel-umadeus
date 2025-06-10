"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagens: string[];
  slug: string;
  tamanhos?: string[];
  generos?: string[];
  categoria: string;
}

const TAMANHOS = ["PP", "P", "M", "G", "GG"];
const GENEROS = ["masculino", "feminino"];

export default function ProdutosFiltrados({
  produtos,
}: {
  produtos: Produto[];
}) {
  const [tamanho, setTamanho] = useState("");
  const [genero, setGenero] = useState("");

  const filtrados = produtos.filter((p) => {
    const matchTamanho =
      tamanho === "" || (p.tamanhos || []).includes(tamanho);
    const matchGenero =
      genero === "" || (p.generos || []).includes(genero);
    return matchTamanho && matchGenero;
  });

  return (
    <>
      <div className="flex gap-4 mb-6">
        <select
          value={tamanho}
          onChange={(e) => setTamanho(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="">Todos os tamanhos</option>
          {TAMANHOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="">Todos os gêneros</option>
          {GENEROS.map((g) => (
            <option key={g} value={g}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {filtrados.map((p) => (
          <div key={p.id} className="bg-white rounded shadow p-2">
            <div className="relative">
              <Image
                src={p.imagens[0]}
                alt={p.nome}
                width={400}
                height={400}
                className="w-full h-auto object-cover rounded"
              />
            </div>

            <h2 className="text-sm font-medium text-black mt-1 line-clamp-2">
              {p.nome}
            </h2>
            <p className="text-base font-semibold text-black_bean mt-1">
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
    </>
  );
}
