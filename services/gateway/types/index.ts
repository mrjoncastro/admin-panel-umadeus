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
      status: 'pago' | 'pendente' | 'vencido' | 'cancelado'
      valor: number | string
      vencimento?: string
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
  /** ID da cobrança gerada no Asaas */
  id_asaas?: string
  id_inscricao: string
  produto: string[]
  tamanho?: string
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado'
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
  /** URL gerada pelo Asaas */
  link_pagamento?: string
  /** Data de vencimento no formato ISO */
  vencimento?: string
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
      status: 'pago' | 'pendente' | 'vencido' | 'cancelado'
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
  preco_bruto: number
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
  // Campos de marketplace
  vendedor_id?: string
  status_aprovacao?: 'pendente' | 'aprovado' | 'rejeitado'
  aprovado_por?: string
  aprovado_em?: string
  rejeitado_motivo?: string
  custo?: number
  margem_vendedor?: number
  created?: string
  expand?: {
    user_org?: {
      id: string
      nome: string
    }
    vendedor_id?: Vendedor
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
  metodo_pagamento: 'pix' | 'boleto'
  checkout_url?: string
  asaas_payment_id?: string
  externalReference: string
  endereco_entrega?: Record<string, unknown>
  created?: string
  updated?: string
}

// =========================
// TIPOS MARKETPLACE - FASE 1
// =========================

export type Vendedor = {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf_cnpj: string
  tipo_pessoa: 'fisica' | 'juridica'
  razao_social?: string
  nome_fantasia?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'suspenso'
  taxa_comissao: number
  bio?: string
  logo_url?: string
  banner_url?: string
  site_url?: string
  instagram?: string
  facebook?: string
  whatsapp?: string
  // Dados bancários
  banco?: string
  agencia?: string
  conta?: string
  tipo_conta?: 'corrente' | 'poupanca'
  pix_key?: string
  // Configurações
  aceita_devolvidos: boolean
  tempo_processamento: number
  politica_troca?: string
  politica_devolucao?: string
  // Métricas
  total_vendas: number
  total_produtos: number
  avaliacao_media: number
  total_avaliacoes: number
  // Multi-tenant
  cliente: string
  // Auditoria
  aprovado_por?: string
  aprovado_em?: string
  rejeitado_motivo?: string
  created?: string
  updated?: string
  expand?: {
    aprovado_por?: {
      id: string
      nome: string
    }
  }
}

export type VendedorDocumento = {
  id: string
  vendedor_id: string
  tipo_documento: 'rg' | 'cpf' | 'cnpj' | 'contrato_social' | 'comprovante_endereco' | 'comprovante_bancario'
  nome_arquivo: string
  url_arquivo: string
  verificado: boolean
  verificado_por?: string
  verificado_em?: string
  observacoes?: string
  created?: string
  updated?: string
  expand?: {
    vendedor_id?: Vendedor
    verificado_por?: {
      id: string
      nome: string
    }
  }
}

export type AvaliacaoVendedor = {
  id: string
  vendedor_id: string
  usuario_id: string
  pedido_id?: string
  nota: number
  comentario?: string
  resposta_vendedor?: string
  respondido_em?: string
  cliente: string
  created?: string
  updated?: string
  expand?: {
    vendedor_id?: Vendedor
    usuario_id?: {
      id: string
      nome: string
    }
    pedido_id?: Pedido
  }
}

export type MensagemVendedor = {
  id: string
  vendedor_id: string
  usuario_id: string
  produto_id?: string
  remetente: 'vendedor' | 'usuario'
  mensagem: string
  lida: boolean
  cliente: string
  created?: string
  updated?: string
  expand?: {
    vendedor_id?: Vendedor
    usuario_id?: {
      id: string
      nome: string
    }
    produto_id?: Produto
  }
}

export type ComissaoVendedor = {
  id: string
  vendedor_id: string
  pedido_id: string
  produto_id: string
  valor_produto: number
  valor_comissao: number
  taxa_comissao: number
  status: 'pendente' | 'pago' | 'cancelado'
  data_pagamento?: string
  observacoes?: string
  cliente: string
  created?: string
  updated?: string
  expand?: {
    vendedor_id?: Vendedor
    pedido_id?: Pedido
    produto_id?: Produto
  }
}

// Formulários de cadastro
export type VendedorForm = Omit<Vendedor, 'id' | 'status' | 'total_vendas' | 'total_produtos' | 'avaliacao_media' | 'total_avaliacoes' | 'created' | 'updated'>

export type VendedorDocumentoForm = {
  tipo_documento: VendedorDocumento['tipo_documento']
  arquivo: File
  observacoes?: string
}
