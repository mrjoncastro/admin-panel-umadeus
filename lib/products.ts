export interface ProdutoRecord {
  id: string
  nome: string
  preco: number
  imagens?: string[]
  checkout_url?: string
  categoria?: string
  ativo?: boolean
  [key: string]: unknown
}

export function filtrarProdutos(
  produtos: ProdutoRecord[],
  categoria?: string,
): ProdutoRecord[] {
  return produtos.filter(
    (p) => p.ativo === true && (!categoria || p.categoria === categoria),
  )
}
