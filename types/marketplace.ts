// Tipos específicos para o Marketplace
import type { Produto, Pedido } from './index'

export type Vendor = {
  id: string
  nome: string
  nome_fantasia?: string
  documento: string // CPF ou CNPJ
  tipo_documento: 'cpf' | 'cnpj'
  email: string
  telefone: string
  data_nascimento?: string
  // Campos de endereço alinhados com o sistema atual
  cep: string
  endereco: string
  numero: number
  endereco_complemento?: string
  bairro: string
  cidade: string
  estado: string
  endereco_pais: string
  genero?: 'masculino' | 'feminino'
  status: 'ativo' | 'suspenso' | 'pendente_aprovacao' | 'rejeitado'
  data_aprovacao?: string
  aprovado_por?: string // ID da relação com usuarios (pbc_882525820)
  motivo_rejeicao?: string
  comissao_percentual: number
  valor_minimo_saque: number
  // Dados bancários
  banco: string
  agencia: string
  conta: string
  tipo_conta: 'corrente' | 'poupanca'
  titular: string
  documento_titular: string
  // Configurações
  auto_aprovar_produtos: boolean
  notificar_vendas: boolean
  notificar_comissoes: boolean
  periodo_saque?: 'semanal' | 'quinzenal' | 'mensal'
  // Arquivos e links
  logo_url?: string // campo file
  documentos_verificacao?: string[] // campo file
  descricao?: string // campo editor
  website?: string // campo url
  instagram?: string
  facebook?: string
  whatsapp?: string
  // Relacionamentos obrigatórios
  cliente: string // relação com m24_clientes (pbc_328821001)
  created_by: string // relação com usuarios (pbc_882525820)
  created_by_role: 'coordenador' | 'lider'
  // Campos de sistema
  created: string
  updated: string
  expand?: {
    cliente?: {
      id: string
      nome: string
      dominio: string
    }
    created_by?: {
      id: string
      nome: string
      role: string
    }
    aprovado_por?: {
      id: string
      nome: string
    }
  }
}

export type ProdutoMarketplace = Produto & {
  vendor_id?: string // relação com vendors
  origem?: 'admin' | 'vendor'
  created_by?: string // relação com usuarios (pbc_882525820)
  created_by_role?: 'coordenador' | 'lider' | 'fornecedor'
  moderacao_status?: 'pendente' | 'aprovado' | 'rejeitado' | 'revisao'
  aprovado_por?: string // relação com usuarios (pbc_882525820)
  aprovado_por_role?: 'coordenador' | 'lider'
  data_aprovacao?: string
  motivo_rejeicao?: string
  observacoes_internas?: string
  destaque?: boolean
  vendas_totais?: number
  estoque_disponivel?: number
  estoque_minimo?: number
  peso?: number
  dimensoes_altura?: number
  dimensoes_largura?: number
  dimensoes_profundidade?: number
  expand?: Produto['expand'] & {
    vendor?: Vendor
    avaliacoes?: ProdutoAvaliacao[]
    created_by_user?: {
      id: string
      nome: string
      role: string
    }
    aprovado_por_user?: {
      id: string
      nome: string
    }
  }
}

export type Comissao = {
  id: string
  vendor_id: string // relação com vendors
  pedido_id: string // relação com pedidos (pbc_4131763008)
  produto_id: string // relação com produtos (pbc_1135311916)
  produto_nome: string
  cliente_nome: string
  valor_venda: number
  percentual_comissao: number
  valor_comissao: number
  status: 'pendente' | 'liberada' | 'paga' | 'cancelada'
  data_venda: string
  data_liberacao?: string
  data_pagamento?: string
  forma_pagamento?: 'pix' | 'ted' | 'doc'
  comprovante_pagamento?: string // campo file
  observacoes?: string // campo editor
  cliente: string // relação com m24_clientes (pbc_328821001)
  created: string
  updated: string
  expand?: {
    vendor?: Vendor
    pedido?: Pedido
    produto?: ProdutoMarketplace
    cliente_obj?: {
      id: string
      nome: string
    }
  }
}

export type SaqueComissao = {
  id: string
  vendor_id: string // relação com vendors
  comissoes_ids: string[] // campo json
  valor_solicitado: number
  taxa_saque: number
  valor_liquido: number
  status: 'solicitado' | 'processando' | 'pago' | 'cancelado'
  data_solicitacao: string
  data_processamento?: string
  data_pagamento?: string
  processado_por?: string // relação com usuarios (pbc_882525820)
  forma_pagamento?: 'pix' | 'ted' | 'doc'
  comprovante?: string // campo file
  observacoes?: string // campo editor
  cliente: string // relação com m24_clientes (pbc_328821001)
  created: string
  updated: string
  expand?: {
    vendor?: Vendor
    comissoes?: Comissao[]
    processado_por_user?: {
      id: string
      nome: string
    }
    cliente_obj?: {
      id: string
      nome: string
    }
  }
}

export type ProdutoAvaliacao = {
  id: string
  produto_id: string // relação com produtos (pbc_1135311916)
  cliente_id: string // relação com usuarios (pbc_882525820)
  pedido_id: string // relação com pedidos (pbc_4131763008)
  nota: number // 1-5
  comentario?: string // campo editor
  data_compra: string
  verificada?: boolean
  resposta_vendor?: string // campo editor
  data_resposta?: string
  status: 'ativa' | 'moderada' | 'removida'
  denuncias?: number
  cliente: string // relação com m24_clientes (pbc_328821001)
  created: string
  updated: string
  expand?: {
    produto?: ProdutoMarketplace
    cliente_usuario?: {
      id: string
      nome: string
    }
    pedido?: Pedido
    cliente_obj?: {
      id: string
      nome: string
    }
  }
}

export type MarketplaceConfig = {
  id: string
  cliente: string // relação com m24_clientes (pbc_328821001)
  habilitado?: boolean
  comissao_padrao?: number
  valor_minimo_saque?: number
  taxa_saque?: number
  periodo_retencao_dias?: number
  moderacao_produtos?: boolean
  auto_aprovar_vendors?: boolean
  categorias_permitidas?: string[] // campo json
  formas_pagamento_comissao?: ('pix' | 'ted' | 'doc')[] // campo json
  notificar_novo_vendor?: boolean
  notificar_novo_produto?: boolean
  notificar_venda?: boolean
  termos_uso_vendor?: string // campo editor
  politica_comissao?: string // campo editor
  created: string
  updated: string
  expand?: {
    cliente_obj?: {
      id: string
      nome: string
      dominio: string
    }
  }
}

export type VendorAnalytics = {
  id: string
  vendor_id: string // relação com vendors
  periodo: string // YYYY-MM format
  vendas_quantidade?: number
  vendas_valor?: number
  comissao_valor?: number
  ticket_medio?: number
  produtos_cadastrados?: number
  produtos_aprovados?: number
  produtos_rejeitados?: number
  visualizacoes_produtos?: number
  avaliacoes_recebidas?: number
  nota_media?: number
  conversao_taxa?: number
  cliente: string // relação com m24_clientes (pbc_328821001)
  created: string
  updated: string
  expand?: {
    vendor?: Vendor
    cliente_obj?: {
      id: string
      nome: string
    }
  }
}

export type VendorNotificacao = {
  id: string
  vendor_id: string // relação com vendors
  tipo: 'nova_venda' | 'produto_aprovado' | 'produto_rejeitado' | 'comissao_liberada' | 'saque_processado'
  titulo: string
  mensagem: string // campo editor
  link?: string // campo url
  dados_extras?: Record<string, any> // campo json
  lida?: boolean
  data_leitura?: string
  cliente: string // relação com m24_clientes (pbc_328821001)
  created: string
  updated: string
  expand?: {
    vendor?: Vendor
    cliente_obj?: {
      id: string
      nome: string
    }
  }
}

// Extensões dos tipos existentes para suporte a vendors

export type UsuarioComVendor = {
  vendor_id?: string // relação com vendors
  vendor_approved?: boolean
}

export type ProdutoComVendor = {
  vendor_ids?: string[] // campo json - IDs dos vendors relacionados
  gera_comissao?: boolean
  comissao_calculada?: boolean
  comissao_valor_total?: number
}

export type PedidoComVendor = {
  vendor_ids?: string[] // campo json - IDs dos vendors dos produtos
  gera_comissao?: boolean
  comissao_calculada?: boolean
  comissao_valor_total?: number
}

// Tipos para relatórios e métricas
export type VendorMetricas = {
  totalProdutos: number
  totalVendas: number
  receitaTotal: number
  comissaoPendente: number
  avaliacaoMedia: number
  totalAvaliacoes: number
  produtosAprovados: number
  produtosPendentes: number
  vendasMes: number
  crescimentoMes: number
}

// Cache de produtos para performance (futuro)
export type ProdutoCache = {
  id: string
  produto_id: string
  dados_produto: ProdutoMarketplace
  visualizacoes_24h: number
  vendas_7d: number
  score_popularidade: number
  ultima_atualizacao: string
  cliente: string
  created: string
  updated: string
}

// Sistema de denúncias (futuro)
export type DenunciaVendor = {
  id: string
  vendor_id: string
  denunciante_id?: string
  tipo: 'produto_inadequado' | 'comportamento_inadequado' | 'fraude' | 'outros'
  descricao: string
  evidencias?: string[]
  status: 'aberta' | 'investigando' | 'resolvida' | 'improcedente'
  resolucao?: string
  resolvida_por?: string
  data_resolucao?: string
  cliente: string
  created: string
  updated: string
}

// Queue jobs para processamento assíncrono (futuro)
export type QueueJob = {
  id: string
  tipo: 'calcular_comissao' | 'processar_saque' | 'enviar_email' | 'atualizar_analytics' | 'moderar_produto'
  payload: Record<string, any>
  status: 'pendente' | 'processando' | 'concluido' | 'falhou'
  prioridade: 'alta' | 'media' | 'baixa'
  tentativas: number
  max_tentativas: number
  agendado_para?: string
  processado_em?: string
  erro?: string
  cliente: string
  created: string
  updated: string
}

// Relatórios do marketplace (futuro)
export type RelatorioMarketplace = {
  id: string
  tipo: 'vendas_vendor' | 'comissoes_periodo' | 'produtos_performance' | 'usuarios_atividade'
  periodo_inicio: string
  periodo_fim: string
  filtros?: Record<string, any>
  dados: Record<string, any>
  formato: 'json' | 'csv' | 'pdf'
  arquivo_url?: string
  solicitado_por: string
  status: 'processando' | 'concluido' | 'erro'
  cliente: string
  created: string
}