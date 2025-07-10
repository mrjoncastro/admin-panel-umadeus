'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { calculateGross } from '@/lib/asaasFees'

interface Produto {
  id: string
  nome: string
  preco: number
  imagens: string[]
  slug: string
}

export default function Home() {
  const [produtosDestaque, setProdutosDestaque] = useState<Produto[]>([])

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const res = await fetch('/api/produtos', { credentials: 'include' })
        if (res.ok) {
          const list = (await res.json()) as Produto[]
          const prods = list.map((p) => ({
            ...p,
            preco: calculateGross(p.preco, 'pix', 1).gross,
          }))
          setProdutosDestaque(prods)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchProdutos()
  }, [])

  return (
    <>
      {/* HERO Congresso */}
      <section className="w-full bg-primary-900 min-h-[400px] md:min-h-[540px] grid grid-cols-1 md:grid-cols-2">
        {/* Esquerda: Texto */}
        <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left bg-primary-600 px-8">
          <span className="mb-4 px-4 py-1 bg-white/20 text-white rounded-full text-xs uppercase tracking-wide font-semibold">
            Inscrições abertas!
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-bebas uppercase tracking-wide text-white mb-4">
            Congresso UMADEUS 2K25
          </h1>
          <p className="text-base md:text-lg text-white/90 mb-8 max-w-lg">
            Prepare-se para dias de avivamento, comunhão e crescimento
            espiritual. Faça já sua inscrição no maior encontro jovem do ano!
          </p>
          <Link
            href="/loja/eventos"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-full font-semibold transition text-lg hover:bg-gray-100"
          >
            Inscreva-se agora
          </Link>
        </div>
        {/* Direita: Imagem crua */}
        <div className="relative w-full h-[300px] md:h-auto">
          <Image
            src="/img/M24_tech.webp"
            alt="Congresso UMADEUS"
            fill
            style={{ objectFit: 'cover' }}
            className="w-full h-full"
            priority
          />
        </div>
      </section>

      {/* PRODUTOS DESTAQUE */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--accent)]">
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
                .replace('.', ',')}`}</span>
              <Link
                href={`/loja/produtos/${prod.slug}`}
                className="bg-primary-600 hover:bg-primary-900 text-white px-6 py-2 rounded-full font-semibold text-sm transition"
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
  )
}
