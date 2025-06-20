'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import type { Metadata } from 'next'
import { getProductBySlug } from '@/lib/products/getProductBySlug'

interface Params {
  slug: string
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const produto = await getProductBySlug(params.slug)
  if (!produto) {
    return {
      title: 'Produto não encontrado',
      description: 'Detalhes não disponíveis',
    }
  }
  const imagem = Array.isArray(produto.imagens)
    ? produto.imagens[0]
    : typeof produto.imagens === 'object'
      ? Object.values(produto.imagens)[0]?.[0]
      : produto.imagem || '/img/og-default.jpg'
  return {
    title: produto.nome,
    description: produto.descricao || '',
    openGraph: {
      title: produto.nome,
      description: produto.descricao || '',
      images: [imagem],
    },
  }
}

import ProdutoInterativo from './ProdutoInterativo'
import type { Produto as ProdutoBase } from '@/types'
export default function ProdutoDetalhe() {
  const { slug } = useParams<{ slug: string }>()
  const [produto, setProduto] = useState<ProdutoBase | null>(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/produtos/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((p: ProdutoBase) => {
        setProduto(p)
      })
      .catch(() => setErro(true))
  }, [slug])

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
    )
  }

  if (!produto) {
    return (
      <main className="font-sans px-4 md:px-16 py-10">
        <LoadingOverlay show={true} text="Carregando..." />
      </main>
    )
  }

  // Normaliza imagens e gêneros
  let generos: string[] = []
  let imagens: Record<string, string[]> = {}

  // Tenta extrair lista de gêneros armazenada no produto
  if (produto.generos) {
    generos = Array.isArray(produto.generos)
      ? produto.generos.map((g) => g.trim())
      : produto.generos.split(',').map((g) => g.trim())
  }

  if (typeof produto.imagens === 'object' && !Array.isArray(produto.imagens)) {
    // formato: { masculino: [...], feminino: [...] }
    imagens = produto.imagens as Record<string, string[]>
    if (generos.length === 0) generos = Object.keys(imagens)
  } else {
    // formato: array
    imagens = { default: (produto.imagens as string[]) || [] }
    if (generos.length === 0) generos = ['default']
  }

  const tamanhos = Array.isArray(produto.tamanhos)
    ? produto.tamanhos
    : typeof produto.tamanhos === 'string'
      ? produto.tamanhos.split(',').map((t) => t.trim())
      : ['P', 'M', 'G', 'GG']

  // Make sure parsedValor is declared before it is used
  // Example:
  const parsedValor = Number(produto.preco)

  return (
    <main className="text-platinum font-sans px-4 md:px-16 py-10">
      <Link
        href="/loja/produtos"
        className="text-sm text-platinum hover:text-yellow-400 mb-6 inline-block transition"
      >
        &lt; voltar
      </Link>
      <Suspense fallback={<LoadingOverlay show={true} text="Carregando..." />}>
        <ProdutoInterativo
          imagens={imagens}
          generos={generos}
          tamanhos={tamanhos}
          nome={produto.nome}
          preco={parsedValor}
          descricao={produto.descricao}
          produto={produto}
        />
      </Suspense>
    </main>
  )
}
