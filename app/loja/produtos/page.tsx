"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function ProdutoPage() {
  const [generoSelecionado, setGeneroSelecionado] = useState<
    "masculino" | "feminino"
  >("feminino");
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("P");
  const [indexImg, setIndexImg] = useState(0);
  const pauseRef = useRef(false);

  const tamanhos = ["P", "M", "G", "GG"];

  const imagens: Record<"masculino" | "feminino", string[]> = {
    masculino: [
      "/img/homem1.png",
      "/img/camisa_verso.webp",
      "/img/camisa_frente.webp",
    ],
    feminino: [
      "/img/mulher2.png",
      "/img/camisa_verso.webp",
      "/img/camisa_frente.webp",
    ],
  };

  const imagensAtual = imagens[generoSelecionado];
  const imagemPrincipal = imagensAtual[indexImg];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!pauseRef.current) {
        setIndexImg((prev) => (prev + 1) % imagensAtual.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [imagensAtual]);

  const handleMiniaturaClick = (i: number) => {
    pauseRef.current = true;
    setIndexImg(i);
    setTimeout(() => (pauseRef.current = false), 10000);
  };

  const [checkoutLink, setCheckoutLink] = useState<string>("#");

  useEffect(() => {
    fetch("/api/checkout-link")
      .then((res) => res.json())
      .then((data) => {
        if (data?.url) setCheckoutLink(data.url);
      })
      .catch(() => {
        /* link permanece como '#' */
      });
  }, []);

  return (
    <main className="font-sans px-4 md:px-16 py-10">
      <a
        href="/loja"
        className="text-sm text-platinum hover:text-primary-600 mb-6 inline-block transition"
      >
        &lt; voltar
      </a>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Imagem principal */}
        <div>
          <Image
            src={imagemPrincipal}
            alt="Camiseta UMADEUS"
            width={600}
            height={600}
            className="w-full rounded-xl border border-black_bean shadow-lg transition-all duration-300"
          />
          <div className="flex gap-3 mt-4">
            {imagensAtual.map((src, i) => (
              <Image
                key={i}
                src={src}
                alt={`Miniatura ${i + 1}`}
                width={64}
                height={64}
                onClick={() => handleMiniaturaClick(i)}
                className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition ${
                  indexImg === i
                    ? "border-primary-600 ring-2 ring-primary-600"
                    : "border-black_bean hover:brightness-110"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Detalhes do produto */}
        <div className="space-y-6">
          <h1 className="font-bebas text-primary-600 text-3xl md:text-4xl font-bold leading-tight">
            Camiseta Stanton — Edição Congresso UMADEUS
          </h1>
          <p className="text-xl font-semibold text-platinum">R$ 129,90</p>

          {/* Gênero */}
          <div>
            <p className="text-sm mb-2 text-platinum/80">Modelo:</p>
            <div className="flex gap-3">
              {["masculino", "feminino"].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGeneroSelecionado(g as "masculino" | "feminino");
                    setIndexImg(0);
                    pauseRef.current = false;
                  }}
                  className={`px-4 py-1 rounded-full border font-medium transition ${
                    generoSelecionado === g
                      ? "bg-primary-600 text-white"
                      : "border-platinum/30 text-platinum hover:bg-black_bean"
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tamanhos */}
          <div>
            <p className="text-sm mb-2 text-platinum/80">
              Tamanhos disponíveis:
            </p>
            <div className="flex gap-2">
              {tamanhos.map((t) => (
                <button
                  key={t}
                  onClick={() => setTamanhoSelecionado(t)}
                  className={`px-3 py-1 border rounded-full text-sm transition ${
                    tamanhoSelecionado === t
                      ? "bg-primary-600 text-white font-bold"
                      : "border-platinum/30 text-platinum hover:bg-black_bean"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <a
              href="#"
              className="text-xs underline mt-2 inline-block text-platinum/60 hover:text-primary-600 transition"
            >
              Ver guia de tamanhos
            </a>
          </div>

          {/* Botão de compra */}
          <a
            href={checkoutLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-3 rounded-full font-semibold transition text-lg"
          >
            Quero essa pra brilhar no Congresso!
          </a>

          {/* Envio */}
          <div className="text-sm text-platinum mt-6 space-y-3">
            <div>
              <h2
                className="font-semibold text-base"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Envio e devolução
              </h2>
              <p>
                Entrega rápida em todo o Brasil. Trocas grátis em até 7 dias
                após o recebimento.
              </p>
            </div>

            {/* Detalhes extras */}
            <div className="divide-y divide-platinum/20 mt-4">
              <details className="py-3">
                <summary className="cursor-pointer font-medium">
                  + Sobre o Produto
                </summary>
                <p className="mt-2 text-sm">
                  Camiseta 100% algodão, com caimento confortável e estilo que
                  combina com a juventude cristã.
                </p>
              </details>
              <details className="py-3">
                <summary className="cursor-pointer font-medium">
                  + Cuidados com sua peça
                </summary>
                <p className="mt-2 text-sm">
                  Lave com amor — à mão ou na máquina, sempre com água fria.
                </p>
              </details>
              <details className="py-3">
                <summary className="cursor-pointer font-medium">
                  + Sobre o tecido
                </summary>
                <p className="mt-2 text-sm">
                  Tecido leve e respirável. Ideal pra louvar, pular e viver cada
                  momento do congresso com liberdade.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
