import { Inscricao, Pedido } from '@/types'
import {
  criarInscricao as criarInscricaoTemplate,
  InscricaoTemplate,
} from '@/lib/templates/inscricao'

export type DadosInscricao = InscricaoTemplate & { liderId: string }

export const criarInscricao = criarInscricaoTemplate

export function criarPedido(
  inscricao: Inscricao,
  produto: {
    id: string
    nome?: string
    preco: number
    preco_bruto: number
    tamanhos?: string[] | string
    generos?: string[] | string
  },
): Pedido {
  const first = (v?: string[] | string) => (Array.isArray(v) ? v[0] : v)
  const valor = produto.preco_bruto

  return {
    id: `ped_${inscricao.id}`,
    id_pagamento: '',
    id_inscricao: inscricao.id,
    produto: [produto.id],
    tamanho: inscricao.tamanho || first(produto.tamanhos),
    status: 'pendente',
    cor: 'Roxo',
    genero: inscricao.genero || first(produto.generos),
    responsavel: inscricao.criado_por,
    email: dadosEmail(inscricao),
    canal: 'inscricao',
    valor: valor.toFixed(2),
  }
}

function dadosEmail(inscricao: Inscricao): string {
  return inscricao.email || 'sememail@teste.com'
}
