"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import createPocketBase from "@/lib/pocketbase";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagens: string[];
  slug: string;
}

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [produtosDestaque, setProdutosDestaque] = useState<Produto[]>([]);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const pb = createPocketBase();
        const list = await pb
          .collection("produtos")
          .getList<Produto>(1, 6, { filter: "ativo = true", sort: "-created" });
        const prods = list.items.map((p) => ({
          ...p,
          imagens: (p.imagens || []).map((img) => pb.files.getURL(p, img)),
        }));
        setProdutosDestaque(prods);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProdutos();
  }, []);

  // Se quiser carrossel nos produtos, use funções abaixo:
  const scrollBy = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const offset = el.offsetWidth * 0.8 + 16;
    el.scrollBy({
      left: direction === "right" ? offset : -offset,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* HERO Congresso */}
      <section className="bg-primary-600 py-10 md:py-20 flex flex-col md:flex-row items-center justify-center px-6 max-w-7xl mx-auto rounded-2xl shadow mb-10 overflow-hidden">
        {/* Imagem congresso */}
        <div className="md:w-1/2 flex-shrink-0 flex justify-center mb-6 md:mb-0">
          <Image
            src="/img/congresso_slide1.jpg"
            alt="Congresso UMADEUS"
            width={550}
            height={410}
            className="rounded-2xl shadow-lg object-cover border border-[var(--accent-900)]/20"
            priority
          />
        </div>
        {/* Texto congresso */}
        <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left pl-0 md:pl-10">
          <span className="inline-block mb-3 px-4 py-1 bg-[var(--accent)]/90 text-white rounded-full text-xs uppercase tracking-wide font-semibold shadow">
            Inscrições abertas!
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-bebas uppercase tracking-wide text-[var(--accent)] mb-4">
            Congresso UMADEUS 2K25
          </h1>
          <p className="text-base md:text-lg text-[var(--text-primary)]/90 mb-8 max-w-lg">
            Prepare-se para dias de avivamento, comunhão e crescimento
            espiritual. Faça já sua inscrição no maior encontro jovem do ano!
          </p>
          <Link
            href="/loja/inscricoes"
            className="inline-block bg-[var(--accent)] hover:bg-[var(--accent-900)] text-white px-8 py-3 rounded-full font-semibold transition text-lg shadow"
          >
            Inscreva-se agora
          </Link>
        </div>
      </section>

      {/* PRODUTOS DESTAQUE */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold font-serif tracking-tight text-[var(--accent)]">
            Produtos em Destaque
          </h2>
          <Link
            href="/loja/produtos"
            className="text-[var(--accent)] hover:underline font-medium"
          >
            Ver todos
          </Link>
        </div>
        {/* Grid ou carrossel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {produtosDestaque.map((prod) => (
            <div
              key={prod.id}
              className="rounded-2xl bg-white shadow-sm p-4 flex flex-col items-center transition hover:shadow-lg"
            >
              <Image
                src={prod.imagens[0]}
                alt={prod.nome}
                width={300}
                height={300}
                className="w-full h-64 object-cover rounded-xl mb-4 border border-[var(--accent-900)]/10"
              />
              <h3 className="font-medium text-lg mb-2">{prod.nome}</h3>
              <span className="font-bold text-[var(--accent)] text-lg mb-4">{`R$ ${prod.preco
                .toFixed(2)
                .replace(".", ",")}`}</span>
              <Link
                href={`/loja/produtos/${prod.slug}`}
                className="bg-[var(--accent)] hover:bg-[var(--accent-900)] text-white px-6 py-2 rounded-full font-semibold text-sm transition"
              >
                Ver produto
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FRASE de acolhida */}
      <section className="max-w-2xl mx-auto text-center py-10 px-4">
        <p className="text-xl font-serif text-gray-700 italic">
          “Vista sua fé. Viva seu propósito.”
        </p>
      </section>
    </>
  );
}
