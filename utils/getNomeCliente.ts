import { Pedido } from '@/types'

export function getNomeCliente(pedido: Pedido): string {
  if ((pedido.canal as string) === 'avulso' || pedido.canal === 'loja') {
    return pedido.expand?.responsavel?.nome || ''
  }
  return pedido.expand?.id_inscricao?.nome || ''
}
