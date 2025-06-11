"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import AddToCartButton from "./AddToCartButton";

// Componente para seleção de gênero e tamanho (reutilizável)
function DetalhesSelecao({
  generos,
  tamanhos,
  genero,
  setGenero,
  tamanho,
  setTamanho,
}: {
  generos: string[];
  tamanhos: string[];
  genero: string;
  setGenero: (g: string) => void;
  tamanho: string;
  setTamanho: (t: string) => void;
}) {
  const ALL_GENEROS = ["Masculino", "Feminino"];
  const indisponivel = ALL_GENEROS.filter((g) => !generos.includes(g));

  return (
    <>
      {/* Gênero */}
      <div className="mb-4">
        <p className="text-sm mb-2 text-[var(--text-primary)]/70">Modelo:</p>
        <div className="flex gap-3">
          {ALL_GENEROS.map((g) => {
            const disponivel = generos.includes(g);
            return (
              <button
                key={g}
                onClick={() => disponivel && setGenero(g)}
                disabled={!disponivel}
                className={`px-4 py-1 rounded-full border font-medium transition-colors duration-200 outline-none
              ${
                genero === g && disponivel
                  ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow"
                  : "bg-transparent text-[var(--text-primary)] border-[var(--accent)]/40 hover:bg-[var(--accent)]/10"
              }
              ${!disponivel ? "opacity-50 cursor-not-allowed" : ""}
              focus-visible:ring-2 focus-visible:ring-[var(--accent-900)]`}
              >
                {g}
              </button>
            );
          })}
        </div>
        {indisponivel.length > 0 && (
          <p className="text-xs text-red-600 mt-1">
            {indisponivel
              .map((g) =>
                g === "Masculino" ? "Modelo masculino" : "Modelo Feminino"
              )
              .join(" e ")}{" "}
            indisponível
          </p>
        )}
      </div>
      {/* Tamanhos */}
      <div>
        <p className="text-sm mb-2 text-[var(--text-primary)]/70">
          Tamanhos disponíveis:
        </p>
        <div className="flex gap-2">
          {tamanhos.map((t) => (
            <button
              key={t}
              onClick={() => setTamanho(t)}
              className={`px-3 py-1 border rounded-full text-sm font-medium transition-colors duration-200 outline-none
            ${
              tamanho === t
                ? "bg-[var(--accent)] text-white border-[var(--accent)] font-bold shadow"
                : "bg-transparent text-[var(--text-primary)] border-[var(--accent)]/40 hover:bg-[var(--accent)]/10"
            }
            focus-visible:ring-2 focus-visible:ring-[var(--accent-900)]`}
            >
              {t}
            </button>
          ))}
        </div>
        <a
          href="#"
          className="text-xs underline mt-2 inline-block text-[var(--text-primary)]/50 hover:text-[var(--accent)] transition"
        >
          Ver guia de tamanhos
        </a>
      </div>
    </>
  );
}

export default function ProdutoInterativo({
  imagens,
  generos,
  tamanhos,
  nome,
  preco,
  descricao,
  produto,
  isLoggedIn,
}: {
  imagens: Record<string, string[]>;
  generos: string[];
  tamanhos: string[];
  nome: string;
  preco: number;
  descricao?: string;
  produto: any;
  isLoggedIn: boolean;
}) {
  // Padronização dos gêneros:
  const generosNorm = generos.map((g) =>
    g.trim().toLowerCase() === "masculino"
      ? "Masculino"
      : g.trim().toLowerCase() === "feminino"
      ? "Feminino"
      : g
  );
  const [genero, setGenero] = useState(generosNorm[0]);
  const [tamanho, setTamanho] = useState(tamanhos[0]);
  const coresList = Array.isArray(produto.cores)
    ? produto.cores
    : typeof produto.cores === "string"
    ? produto.cores.split(",").map((c: string) => c.trim())
    : [];
  const [cor, setCor] = useState(coresList[0] || "");
  const [indexImg, setIndexImg] = useState(0);
  const pauseRef = useRef(false);
  const router = useRouter();

  const imgs = imagens[genero] || imagens[generosNorm[0]];

  useEffect(() => {
    setIndexImg(0);
  }, [genero]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!pauseRef.current) {
        setIndexImg((prev) => (prev + 1) % imgs.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [imgs]);

  const handleMiniaturaClick = (i: number) => {
    pauseRef.current = true;
    setIndexImg(i);
    setTimeout(() => (pauseRef.current = false), 10000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-12 items-start">
      {/* Galeria de imagens */}
      <div>
        <Image
          src={imgs[indexImg]}
          alt={nome}
          width={480}
          height={480}
          className="w-full max-w-[480px] mx-auto rounded-xl border border-[var(--accent-900)] shadow-lg transition-all duration-300 bg-[var(--background)]"
          priority
        />
        <div className="flex gap-3 mt-4">
          {imgs.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={`Miniatura ${i + 1}`}
              width={64}
              height={64}
              onClick={() => handleMiniaturaClick(i)}
              className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition
              ${
                indexImg === i
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]"
                  : "border-[var(--accent-900)] hover:brightness-110"
              }`}
            />
          ))}
        </div>
        {/* Tamanhos e gênero no mobile */}
        <div className="block md:hidden mt-6">
          <DetalhesSelecao
            generos={generosNorm}
            tamanhos={tamanhos}
            genero={genero}
            setGenero={setGenero}
            tamanho={tamanho}
            setTamanho={setTamanho}
          />
          {coresList.length > 0 && (
            <div className="mt-4">
              <p className="text-sm mb-2 text-[var(--text-primary)]/70">Cores disponíveis:</p>
              <div className="flex gap-2">
                {coresList.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      cor === c
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent)]"
                        : "border-[var(--accent-900)]"
                    }`}
                    style={{ background: c }}
                    aria-label={`Selecionar cor ${c}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Detalhes do produto */}
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold font-bebas leading-tight text-[var(--accent)]">
          {nome}
        </h1>
        <p className="text-xl font-semibold text-[var(--text-primary)]">
          R$ {preco.toFixed(2).replace(".", ",")}
        </p>
        <div className="hidden md:block">
          <DetalhesSelecao
            generos={generosNorm}
            tamanhos={tamanhos}
            genero={genero}
            setGenero={setGenero}
            tamanho={tamanho}
            setTamanho={setTamanho}
          />
          {coresList.length > 0 && (
            <div className="mt-4">
              <p className="text-sm mb-2 text-[var(--text-primary)]/70">Cores disponíveis:</p>
              <div className="flex gap-2">
                {coresList.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      cor === c
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent)]"
                        : "border-[var(--accent-900)]"
                    }`}
                    style={{ background: c }}
                    aria-label={`Selecionar cor ${c}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Botões em linha */}
        <div className="flex flex-col md:flex-row gap-3 mt-4">
          <button
            onClick={() => {
              if (!isLoggedIn) {
                router.push("/login?redirect=/loja/checkout");
              } else {
                router.push("/loja/checkout");
              }
            }}
            className="w-full md:w-auto btn btn-primary text-center"
          >
            Quero essa pra brilhar no Congresso!
          </button>
          <div className="w-full md:w-auto">
            <AddToCartButton
              produto={{
                ...produto,
                imagens: Array.isArray(produto.imagens)
                  ? produto.imagens
                  : imagens[genero] || [],
                generos: [genero],
                tamanhos: [tamanho],
                cores: cor ? [cor] : [],
              }}
            />
          </div>
        </div>
        {/* Resto dos detalhes */}
        {descricao && (
          <p className="text-sm text-[var(--text-primary)]/80 mt-4 whitespace-pre-line">
            {descricao}
          </p>
        )}
        <div className="text-sm text-[var(--text-primary)]/70 mt-6 space-y-3">
          <div>
            <h2 className="font-semibold text-base">Envio e devolução</h2>
            <p>
              Entrega rápida em todo o Brasil. Trocas grátis em até 7 dias após o recebimento.
            </p>
          </div>
          <div className="divide-y divide-[var(--accent-900)]/10 mt-4">
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
  );
}
