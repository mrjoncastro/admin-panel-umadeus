import { Inscricao, Pedido } from '@/types'

export type DadosInscricao = {
  nome: string
  email: string
  telefone: string
  cpf: string
  data_nascimento: string
  genero: string
  evento: string
  liderId: string
  produto: string
  tamanho?: string
}

let idCounter = 1

export function criarInscricao(dados: DadosInscricao): Inscricao {
  const obrigatorios = [
    dados.nome,
    dados.email,
    dados.telefone,
    dados.cpf,
    dados.data_nascimento,
    dados.genero,
    dados.liderId,
    dados.evento
  ]

  if (obrigatorios.some(v => !v || v.trim() === '')) {
    throw new Error('Todos os campos são obrigatórios.')
  }

  return {
    id: `insc_${idCounter++}`,
    nome: dados.nome,
    telefone: dados.telefone,
    cpf: dados.cpf,
    evento: dados.evento,
    tamanho: dados.tamanho,
    produto: dados.produto,
    genero: dados.genero,
    criado_por: dados.liderId,
    data_nascimento: dados.data_nascimento,
    status: 'pendente'
  }
}

export function criarPedido(
  inscricao: Inscricao,
  produto: { nome?: string; preco: number; tamanhos?: string[] | string; generos?: string[] | string }
): Pedido {
  const first = (v?: string[] | string) =>
    Array.isArray(v) ? v[0] : v;
  const valor = produto.preco

  return {
    id: `ped_${inscricao.id}`,
    id_pagamento: '',
    id_inscricao: inscricao.id,
    produto: produto.nome ?? inscricao.produto ?? 'Kit Camisa + Pulseira',
    tamanho: inscricao.tamanho || first(produto.tamanhos),
    status: 'pendente',
    cor: 'Roxo',
    genero: inscricao.genero || first(produto.generos),
    responsavel: inscricao.criado_por,
    email: dadosEmail(inscricao),
    valor: valor.toFixed(2),
    canal: 'inscricao'
  }
}

function dadosEmail(inscricao: Inscricao): string {
  return inscricao.email || 'sememail@teste.com'
}
