"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Produto } from "@/types";

export default function Home() {
  const sections = ["mulher", "homem", "congresso"] as const;
  type Section = (typeof sections)[number];

  const [section, setSection] = useState<Section>("mulher");
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRestoreRef = useRef<NodeJS.Timeout | null>(null);

  const content = {
    mulher: {
      images: [
        "/img/mulher2.png",
        "/img/camisa_verso.webp",
        "/img/camisa_frente.webp",
      ],
      title: "Cheias de fé, força e propósito.",
      text: "A nova coleção celebra a beleza da mulher cristã: leve, confiante e pronta pra viver sua missão.",
      bannerButton: "Ver Coleção Feminina",
    },
    homem: {
      images: [
        "/img/homem1.png",
        "/img/camisa_verso.webp",
        "/img/camisa_frente.webp",
      ],
      title: "Fortes na fé. Firmes no estilo.",
      text: "Roupas pensadas pra juventude que corre com propósito, sem perder o foco no Reino.",
      bannerButton: "Ver Linha Masculina",
    },
  }[section as "mulher" | "homem"];

  const scrollBy = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const offset = el.offsetWidth * 0.8 + 16;
    el.scrollBy({
      left: direction === "right" ? offset : -offset,
      behavior: "smooth",
    });
  };

  const pauseAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRestoreRef.current) clearTimeout(timeoutRestoreRef.current);

    timeoutRestoreRef.current = setTimeout(() => {
      startAutoScroll();
    }, 5000);
  };

  const startAutoScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    intervalRef.current = setInterval(() => {
      const scrollAmount = el.offsetWidth * 0.8 + 16;
      if (el.scrollLeft + scrollAmount >= el.scrollWidth - el.offsetWidth) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 3000);
  };

  useEffect(() => {
    if (section !== "congresso") startAutoScroll();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRestoreRef.current) clearTimeout(timeoutRestoreRef.current);
    };
  }, [section]);

  useEffect(() => {
    fetch("/api/produtos")
      .then((res) => res.json())
      .then(setProdutos)
      .catch(() => {
        /* ignore */
      });
  }, []);

  return (
    <>
      {/* Header */}
      <header className="bg-[var(--background)] px-6 py-4 shadow-md rounded-2xl mx-4 mt-4">
        <nav className="flex justify-center items-center text-sm font-semibold tracking-wide">
          <div className="flex gap-4">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`px-4 py-1 rounded-full transition font-bold ${
                  section === s
                    ? "bg-[var(--accent)] text-white shadow"
                    : "bg-transparent text-[var(--text-primary)] hover:bg-[var(--accent)]/10"
                }`}
              >
                {s === "congresso"
                  ? "Congresso 2K25"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="pt-20 p-6 max-w-7xl mx-auto text-center font-sans text-[var(--text-primary)]">
        {section === "congresso" ? (
          <section className="max-w-6xl mx-auto py-12 px-6 text-center md:text-left grid md:grid-cols-2 gap-10 items-center">
            {/* Imagem destacada */}
            <div className="w-full">
              <Image
                src="/img/congresso_slide1.jpg"
                alt="Congresso UMADEUS"
                width={800}
                height={600}
                className="w-full rounded-xl shadow-lg border border-[var(--accent-900)]/20"
              />
            </div>
            {/* Conteúdo textual */}
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold font-bebas uppercase tracking-wide text-[var(--accent)] mb-4">
                Congresso UMADEUS 2K25
              </h2>
              <p className="text-[var(--text-primary)]/90 leading-relaxed text-base md:text-lg mb-6">
                Jovem, Deus tem algo poderoso para sua vida! Esteja pronto para
                um tempo de
                <strong> renovação</strong>, <strong>avivamento</strong> e
                <strong> crescimento espiritual</strong>. Não perca o{" "}
                <strong>Congresso de Jovens 2025</strong> — um encontro que vai
                marcar sua geração.
              </p>
              <Link
                href="/loja/inscricoes"
                className="inline-block bg-[var(--accent)] hover:bg-[var(--accent-900)] text-white px-8 py-3 rounded-full font-semibold transition"
              >
                Inscreva-se agora
              </Link>
            </div>
          </section>
        ) : (
          <>
            {/* Mobile Carousel */}
            <div className="block md:hidden relative">
              <button
                onClick={() => {
                  scrollBy("left");
                  pauseAutoScroll();
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--accent-900)]/80 p-2 rounded-full shadow-md"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => {
                  scrollBy("right");
                  pauseAutoScroll();
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--accent-900)]/80 p-2 rounded-full shadow-md"
              >
                <ChevronRight size={20} />
              </button>
              <div
                ref={carouselRef}
                className="overflow-x-auto flex gap-4 snap-x scroll-smooth pb-4"
                onTouchStart={pauseAutoScroll}
                onMouseDown={pauseAutoScroll}
              >
                {content.images.map((src, index) => (
                  <Image
                    key={index}
                    src={src}
                    alt={`Banner ${section} ${index + 1}`}
                    width={600}
                    height={600}
                    className="w-[80%] flex-shrink-0 rounded-xl snap-center object-cover transition transform hover:scale-105 hover:shadow-lg border-4 border-[var(--accent-900)]"
                  />
                ))}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 mb-8">
              {content.images.map((src, index) => (
                <Image
                  key={index}
                  src={src}
                  alt={`Banner ${section} ${index + 1}`}
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover rounded-xl transition hover:scale-105 hover:shadow-lg border border-[var(--accent-900)]/30"
                />
              ))}
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold mb-3 font-bebas tracking-wide uppercase text-[var(--accent)]">
              {content.title}
            </h2>

            <p className="mb-6 text-base md:text-lg font-medium text-[var(--text-primary)]/90 max-w-2xl mx-auto">
              {content.text}
            </p>

            <Link
              href="/loja/produtos"
              className="inline-block mt-2 px-8 py-3 rounded-full font-semibold transition transform hover:scale-105 shadow-lg text-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-900)]"
            >
              {content.bannerButton}
            </Link>
          </>
        )}
      </main>
    </>
  );
}
