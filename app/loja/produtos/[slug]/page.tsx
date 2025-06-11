"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import { useAuthContext } from "@/lib/context/AuthContext";
import createPocketBase from "@/lib/pocketbase";
import ProdutoInterativo from "./ProdutoInterativo";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagens: string[] | Record<string, string[]>;
  slug: string;
  descricao?: string;
  cores?: string | string[];
  tamanhos?: string | string[];
  generos?: string | string[];
  checkout_url?: string;
}
export default function ProdutoDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [erro, setErro] = useState(false);
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    if (!slug) return;
    const pb = createPocketBase();
    pb
      .collection("produtos")
      .getFirstListItem<Produto>(`slug = '${slug}'`)
      .then((p) => {
        const imgs = Array.isArray(p.imagens)
          ? p.imagens.map((img) => pb.files.getURL(p, img))
          : Object.fromEntries(
              Object.entries(p.imagens as Record<string, string[]>).map(
                ([g, arr]) => [g, arr.map((img) => pb.files.getURL(p, img))]
              )
            );
        setProduto({ ...p, imagens: imgs });
      })
      .catch(() => setErro(true));
  }, [slug]);

  if (erro) {
    return (
      <main className="font-sans px-4 md:px-16 py-10">
        <Link
          href="/loja/produtos"
          className="text-sm text-platinum hover:text-primary-600 mb-6 inline-block transition"
        >
          &lt; voltar
        </Link>
        <div className="text-center text-red-500 text-lg mt-10">
          Produto não encontrado ou ocorreu um erro.
        </div>
      </main>
    );
  }

  if (!produto) {
    return (
      <main className="font-sans px-4 md:px-16 py-10">
        <div>Carregando...</div>
      </main>
    );
  }

  // Normaliza imagens, tamanhos, generos
  let generos: string[] = [];
  let imagens: Record<string, string[]> = {};
  if (typeof produto.imagens === "object" && !Array.isArray(produto.imagens)) {
    // formato: { masculino: [...], feminino: [...] }
    imagens = produto.imagens as Record<string, string[]>;
    generos = Object.keys(imagens);
  } else {
    // formato: array
    imagens = { default: (produto.imagens as string[]) || [] };
    generos = ["default"];
  }

  const tamanhos = Array.isArray(produto.tamanhos)
    ? produto.tamanhos
    : typeof produto.tamanhos === "string"
    ? produto.tamanhos.split(",").map((t) => t.trim())
    : ["P", "M", "G", "GG"];

  return (
    <main className="text-platinum font-sans px-4 md:px-16 py-10">
      <Link
        href="/loja/produtos"
        className="text-sm text-platinum hover:text-yellow-400 mb-6 inline-block transition"
      >
        &lt; voltar
      </Link>
      <Suspense fallback={<div>Carregando...</div>}>
        <ProdutoInterativo
          imagens={imagens}
          generos={generos}
          tamanhos={tamanhos}
          nome={produto.nome}
          preco={produto.preco}
          descricao={produto.descricao}
          produto={produto}
          isLoggedIn={isLoggedIn}
        />
      </Suspense>
    </main>
  );
}
