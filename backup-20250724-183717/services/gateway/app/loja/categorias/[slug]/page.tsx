// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

// app/loja/categorias/[slug]/page.tsx
// [REMOVED] PocketBase import
import ProdutosFiltrados from './ProdutosFiltrados.dynamic'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

interface Produto {
  id: string
  nome: string
  preco: number
  imagens: string[]
  slug: string
  categoria: string
}

interface Params {
  slug: string
}

export default async function CategoriaDetalhe({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  // const pb = createPocketBase() // [REMOVED]
  const tenantId = await getTenantFromHost()

  const produtosPB: Produto[] = await // pb. // [REMOVED] collection('produtos').getFullList({
    filter: `ativo = true && categoria = '${slug}' && cliente='${tenantId}'`,
    sort: '-created',
  })

  const produtos = produtosPB.map((p) => ({
    ...p,
    imagens: (p.imagens || []).map((img) => // pb. // [REMOVED] files.getURL(p, img)),
  }))

  return (
    <main className="p-4 md:p-8 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-platinum">
        Categoria: {slug.charAt(0).toUpperCase() + slug.slice(1)}
      </h1>

      <ProdutosFiltrados produtos={produtos} />
    </main>
  )
}
