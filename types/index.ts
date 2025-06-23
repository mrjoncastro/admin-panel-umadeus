export type Inscricao = {
  id: string
  nome: string
  telefone: string
  email?: string
  status?: 'pendente' | 'aguardando_pagamento' | 'confirmado' | 'cancelado'
  tamanho?: string
  /** Produto selecionado na inscrição */
  produto?: string
  genero?: string
  evento?: string
  data_nascimento?: string
  criado_por?: string
  campo?: string
  cliente?: string
  cpf?: string
  confirmado_por_lider?: boolean
  /** Indica se a inscrição já foi aprovada pela liderança */
  aprovada?: boolean
  created?: string
  expand?: {
    campo?: {
      id: string
      nome: string
    }
    criado_por?: {
      id: string
      nome: string
    }
    pedido?: {
      id: string
      status: 'pago' | 'pendente' | 'cancelado'
      valor: number | string
    }
    produto?: Produto
    id_inscricao?: {
      nome: string
      telefone?: string
      cpf?: string
    }
    evento?: Evento
  }
}

export type Pedido = {
  id: string
  id_pagamento: string
  id_inscricao: string
  produto: string[]
  tamanho?: string
  status: 'pendente' | 'pago' | 'cancelado'
  cor: string
  genero?: string
  data_nascimento?: string
  responsavel?: string
  cliente?: string
  campo?: string
  email: string
  canal: 'loja' | 'inscricao'
  created?: string
  valor: string
  expand?: {
    campo?: {
      id: string
      nome: string
    }
    criado_por?: {
      id: string
      nome: string
    }
    pedido?: {
      id: string
      status: 'pago' | 'pendente' | 'cancelado'
      valor: number | string
    }
    id_inscricao?: {
      nome: string
      telefone?: string
      cpf?: string
    }
    evento?: Evento
    /** Produto associado ao pedido */
    produto?: Produto | Produto[]
  }
}

export type Produto = {
  id: string
  nome: string
  preco: number
  imagem?: string
  imagens?: string[]
  tamanhos?: string[] | string
  generos?: string[] | string
  cores?: string[] | string
  slug: string
  descricao?: string
  detalhes?: string
  /** Se true, exige aprovação de inscrição para compra */
  requer_inscricao_aprovada?: boolean
  /** ID do evento vinculado ao produto */
  evento_id?: string
  checkout_url?: string
  exclusivo_user?: boolean
  ativo?: boolean
  user_org?: string
  cliente?: string
  categoria?: string
  created?: string
  expand?: {
    user_org?: {
      id: string
      nome: string
    }
  }
}

export type Categoria = {
  id: string
  nome: string
  slug: string
}

export type Evento = {
  id: string
  titulo: string
  descricao: string
  data: string
  cidade: string
  imagem?: string
  logo?: string
  status: 'realizado' | 'em breve'
  cobra_inscricao?: boolean
  /** Produto associado à inscrição do evento */
  produto_inscricao?: string
  produtos?: string[]
  expand?: {
    produtos?: Produto[]
  }
  created?: string
}

export type Cliente = {
  id: string
  documento: string
  nome?: string
  dominio?: string
  tipo_dominio?: 'subdominio' | 'proprio' | 'registrado'
  verificado?: boolean
  modo_validacao?: 'wildcard' | 'manual' | 'cloudflare_api'
  logo_url?: string
  cor_primary?: string
  responsavel_nome?: string
  responsavel_email?: string
  ativo?: boolean
  asaas_api_key?: string
  asaas_account_id?: string
  created?: string
}

export type Compra = {
  id: string
  cliente: string
  usuario: string
  itens: Record<string, unknown>[]
  valor_total: number
  status: 'pendente' | 'pago' | 'cancelado'
  metodo_pagamento: 'pix' | 'cartao' | 'boleto'
  checkout_url?: string
  asaas_payment_id?: string
  externalReference: string
  endereco_entrega?: Record<string, unknown>
  created?: string
  updated?: string
}
