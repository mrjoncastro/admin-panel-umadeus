import { Inscricao, Pedido } from '@/types'

export type DadosInscricao = {
  nome: string
  email: string
  telefone: string
  cpf: string
  data_nascimento: string
  genero: string
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
    dados.liderId
  ]

  if (obrigatorios.some(v => !v || v.trim() === '')) {
    throw new Error('Todos os campos são obrigatórios.')
  }

  return {
    id: `insc_${idCounter++}`,
    nome: dados.nome,
    telefone: dados.telefone,
    cpf: dados.cpf,
    evento: 'Congresso UMADEUS 2K25',
    tamanho: dados.tamanho,
    produto: dados.produto,
    genero: dados.genero,
    criado_por: dados.liderId,
    data_nascimento: dados.data_nascimento,
    status: 'pendente'
  }
}

export function criarPedido(inscricao: Inscricao): Pedido {
  const valor = inscricao.produto === 'Somente Pulseira' ? 10.0 : 50.0

  return {
    id: `ped_${inscricao.id}`,
    id_pagamento: '',
    id_inscricao: inscricao.id,
    produto: inscricao.produto || 'Kit Camisa + Pulseira',
    tamanho: inscricao.tamanho,
    status: 'pendente',
    cor: 'Roxo',
    genero: inscricao.genero,
    responsavel: inscricao.criado_por,
    email: dadosEmail(inscricao),
    valor: valor.toFixed(2)
  }
}

function dadosEmail(inscricao: Inscricao): string {
  // tipo Inscricao não possui email, mas fluxo de API usa campo "email"
  // aqui simulamos que email vem via expand
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyInscricao: any = inscricao
  return anyInscricao.email || 'sememail@teste.com'
}
