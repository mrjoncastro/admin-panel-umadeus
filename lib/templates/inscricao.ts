import type { Inscricao } from '@/types'
import type { PaymentMethod } from '@/lib/asaasFees'

export interface InscricaoTemplate {
  nome: string
  email: string
  telefone: string
  cpf: string
  data_nascimento: string
  genero: string
  evento: string
  campo: string
  criado_por: string
  produto?: string
  produto?: string
  tamanho?: string
  cliente?: string
  paymentMethod?: PaymentMethod
  installments?: number
}

let inscricaoCounter = 1

export function criarInscricao(dados: InscricaoTemplate): Inscricao {
  const obrigatorios = [
    dados.nome,
    dados.email,
    dados.telefone,
    dados.cpf,
    dados.data_nascimento,
    dados.genero,
    dados.evento,
    dados.campo,
    dados.criado_por,
  ]

  if (
    obrigatorios.some((v) => !v || (typeof v === 'string' && v.trim() === ''))
  ) {
    throw new Error('Todos os campos obrigatórios devem ser preenchidos.')
  }

  return {
    id: `insc_${inscricaoCounter++}`,
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    cpf: dados.cpf,
    data_nascimento: dados.data_nascimento,
    genero: dados.genero,
    evento: dados.evento,
    campo: dados.campo,
    criado_por: dados.criado_por,
    produto: dados.produto,
    produto: dados.produto,
    tamanho: dados.tamanho,
    cliente: dados.cliente,
    status: 'pendente',
  }
}
