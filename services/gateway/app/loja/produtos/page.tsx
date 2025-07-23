// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

// [REMOVED] PocketBase import
import ProdutosFiltrados from './ProdutosFiltrados.dynamic'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

export const dynamic = 'force-dynamic'

interface Produto {
  id: string
  nome: string
  preco: number
  preco_bruto: number
  imagens: string[]
  slug: string
}

export default async function ProdutosPage() {
  const tenantId = await getTenantFromHost()

  if (!tenantId) {
    return (
      <p className="p-4 text-center font-sans text-[var(--text-primary)]">
        Domínio não configurado
      </p>
    )
  }

  // const pb = createPocketBase() // [REMOVED]
  const list = await // pb. // [REMOVED] collection('produtos').getList<Produto>(1, 50, {
    filter: `ativo = true && cliente='${tenantId}'`,
    sort: '-created',
  })
  const produtosPB: Produto[] = list.items

  const produtos = produtosPB.map((p) => ({
    ...p,
    imagens: (p.imagens || []).map((img) => // pb. // [REMOVED] files.getURL(p, img)),
  }))

  return (
    <main className="max-w-7xl mx-auto px-2 md:px-6 py-8 font-sans text-[var(--text-primary)]">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Produtos</h1>
      <ProdutosFiltrados produtos={produtos} />
    </main>
  )
}
