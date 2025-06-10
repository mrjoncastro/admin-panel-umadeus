"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import AuthModal from "@/app/components/AuthModal";
import AddToCartButton from "./AddToCartButton";

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
  return (
    <>
      {/* Gênero */}
      <div className="mb-4">
        <p className="text-sm mb-2 text-platinum/80">Modelo:</p>
        <div className="flex gap-3">
          {generos.map((g) => (
            <button
              key={g}
              onClick={() => setGenero(g)}
              className={`px-4 py-1 rounded-full border font-medium transition ${
                genero === g
                  ? "bg-cornell_red-600 text-white"
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
        <p className="text-sm mb-2 text-platinum/80">Tamanhos disponíveis:</p>
        <div className="flex gap-2">
          {tamanhos.map((t) => (
            <button
              key={t}
              onClick={() => setTamanho(t)}
              className={`px-3 py-1 border rounded-full text-sm transition ${
                tamanho === t
                  ? "bg-yellow-400 text-black_bean font-bold"
                  : "border-platinum/30 text-platinum hover:bg-black_bean"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <a
          href="#"
          className="text-xs underline mt-2 inline-block text-platinum/60 hover:text-yellow-400 transition"
        >
          Ver guia de tamanhos
        </a>
      </div>
    </>
  );
}

// Componente Client para interatividade (gênero, tamanho, galeria)
export default function ProdutoInterativo({
  imagens,
  generos,
  tamanhos,
  nome,
  preco,
  descricao,
  produto,
  isLoggedIn,
  onRequireAuth,
}: {
  imagens: Record<string, string[]>;
  generos: string[];
  tamanhos: string[];
  nome: string;
  preco: number;
  descricao?: string;
  produto: Produto;
  isLoggedIn: boolean;
  onRequireAuth: () => void;
}) {
  const [genero, setGenero] = useState(generos[0]);
  const [tamanho, setTamanho] = useState(tamanhos[0]);
  const [indexImg, setIndexImg] = useState(0);
  const pauseRef = useRef(false);
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();

  const imgs = imagens[genero] || imagens[generos[0]];

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
      <div>
        <Image
          src={imgs[indexImg]}
          alt={nome}
          width={600}
          height={600}
          className="w-full rounded-xl border border-black_bean shadow-lg transition-all duration-300"
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
              className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition ${
                indexImg === i
                  ? "border-yellow-400 ring-2 ring-yellow-400"
                  : "border-black_bean hover:brightness-110"
              }`}
            />
          ))}
        </div>
        {/* Tamanhos e gênero abaixo da imagem no mobile */}
        <div className="block md:hidden mt-6">
          <DetalhesSelecao
            generos={generos}
            tamanhos={tamanhos}
            genero={genero}
            setGenero={setGenero}
            tamanho={tamanho}
            setTamanho={setTamanho}
          />
        </div>
      </div>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold font-bebas leading-tight text-yellow-400">
          {nome}
        </h1>
        <p className="text-xl font-semibold text-platinum">
          R$ {preco.toFixed(2).replace(".", ",")}
        </p>
        <div className="hidden md:block">
          <DetalhesSelecao
            generos={generos}
            tamanhos={tamanhos}
            genero={genero}
            setGenero={setGenero}
            tamanho={tamanho}
            setTamanho={setTamanho}
          />
        </div>
        <a
          href={produto.checkout_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!isLoggedIn) {
              onRequireAuth();
            } else {
              e.preventDefault();
              router.push("/loja/checkout");
            }
          }}
          className="block w-full btn-primary"
        >
          Quero essa pra brilhar no Congresso!
        </a>
        <AddToCartButton
          produto={{
            ...produto,
            imagens: Array.isArray(produto.imagens)
              ? produto.imagens
              : imagens[genero] || [],
            generos: [genero],
            tamanhos: [tamanho],
            // Normaliza cores para string[]
            cores: Array.isArray(produto.cores)
              ? produto.cores
              : typeof produto.cores === "string"
                ? produto.cores.split(",").map((c) => c.trim())
                : undefined,
          }}
        />
        {showAuth && <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />}
        {descricao && (
          <p className="text-sm text-platinum mt-4 whitespace-pre-line">{descricao}</p>
        )}
        <div className="text-sm text-platinum mt-6 space-y-3">
          <div>
            <h2 className="font-semibold text-base">Envio e devolução</h2>
            <p>
              Entrega rápida em todo o Brasil. Trocas grátis em até 7 dias após o recebimento.
            </p>
          </div>
          <div className="divide-y divide-platinum/20 mt-4">
            <details className="py-3">
              <summary className="cursor-pointer font-medium">+ Sobre o Produto</summary>
              <p className="mt-2 text-sm">
                Camiseta 100% algodão, com caimento confortável e estilo que combina com a juventude
                cristã.
              </p>
            </details>
            <details className="py-3">
              <summary className="cursor-pointer font-medium">+ Cuidados com sua peça</summary>
              <p className="mt-2 text-sm">Lave com amor — à mão ou na máquina, sempre com água fria.</p>
            </details>
            <details className="py-3">
              <summary className="cursor-pointer font-medium">+ Sobre o tecido</summary>
              <p className="mt-2 text-sm">
                Tecido leve e respirável. Ideal pra louvar, pular e viver cada momento do congresso com
                liberdade.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

