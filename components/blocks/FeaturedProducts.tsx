'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { calculateGross } from '@/lib/asaasFees'

interface Produto {
  id: string
  nome: string
  preco: number
  imagens: string[]
  slug: string
}

export default function FeaturedProducts() {
  const [produtos, setProdutos] = useState<Produto[]>([])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/produtos', { credentials: 'include' })
        if (res.ok) {
          const list = (await res.json()) as Produto[]
          setProdutos(
            list.map((p) => ({
              ...p,
              preco: calculateGross(p.preco, 'pix', 1).gross,
            })),
          )
        }
      } catch {
        setProdutos([])
      }
    }
    load()
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--accent)]">
          Produtos em Destaque
        </h2>
        <Link href="/loja/produtos" className="text-[var(--accent)] hover:underline font-medium">
          Ver todos
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {produtos.map((prod) => (
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
            <span className="font-bold text-[var(--accent)] text-lg mb-4">
              {`R$ ${prod.preco.toFixed(2).replace('.', ',')}`}
            </span>
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
  )
}
