import Link from 'next/link'
import { Suspense } from 'react'
import { getProductBySlug } from '@/lib/products/getProductBySlug'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import ProdutoInterativo from '@/components/organisms/ProdutoInterativo'

export default async function ProdutoDetalhe({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const produto = await getProductBySlug(slug)

  if (!produto) {
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

  let generos: string[] = []
  let imagens: Record<string, string[]> = {}

  if (produto.generos) {
    generos = Array.isArray(produto.generos)
      ? produto.generos.map((g) => g.trim())
      : produto.generos.split(',').map((g) => g.trim())
  }

  if (typeof produto.imagens === 'object' && !Array.isArray(produto.imagens)) {
    imagens = produto.imagens as Record<string, string[]>
    if (generos.length === 0) generos = Object.keys(imagens)
  } else {
    imagens = { default: (produto.imagens as string[]) || [] }
    if (generos.length === 0) generos = ['default']
  }

  const tamanhos = Array.isArray(produto.tamanhos)
    ? produto.tamanhos
    : typeof produto.tamanhos === 'string'
      ? produto.tamanhos.split(',').map((t) => t.trim())
      : ['P', 'M', 'G', 'GG']

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
          descricao={produto.descricao}
          produto={produto}
        />
      </Suspense>
    </main>
  )
}
