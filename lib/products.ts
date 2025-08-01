export interface ProdutoRecord {
  id: string
  nome: string
  preco: number
  preco_bruto: number
  imagens?: string[]
  checkout_url?: string
  categoria?: string
  exclusivo_user?: boolean
  ativo?: boolean
  evento_id?: string
  requer_inscricao_aprovada?: boolean
  [key: string]: unknown
}

export function filtrarProdutos(
  produtos: ProdutoRecord[],
  categoria?: string,
  includeInternos = true,
  includeInativos = false,
): ProdutoRecord[] {
  return produtos.filter(
    (p) =>
      (includeInativos || p.ativo === true) &&
      (!categoria || p.categoria === categoria) &&
      (includeInternos || p.exclusivo_user !== true),
  )
}
