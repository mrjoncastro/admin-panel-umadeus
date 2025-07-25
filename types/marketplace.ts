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
  endereco: VendorEndereco
  status: 'ativo' | 'suspenso' | 'pendente_aprovacao' | 'rejeitado'
  comissao_percentual: number
  conta_bancaria: ContaBancaria
  documentos_verificacao: string[]
  data_aprovacao?: string
  aprovado_por?: string
  motivo_rejeicao?: string
  cliente: string // tenant_id
  logo_url?: string
  descricao?: string
  website?: string
  redes_sociais?: {
    instagram?: string
    facebook?: string
    whatsapp?: string
  }
  configuracoes: VendorConfiguracoes
  metricas?: VendorMetricas
  created: string
  updated: string
}

export type VendorEndereco = {
  cep: string
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  pais: string
}

export type ContaBancaria = {
  banco: string
  agencia: string
  conta: string
  tipo_conta: 'corrente' | 'poupanca'
  titular: string
  documento_titular: string
}

export type VendorConfiguracoes = {
  auto_aprovar_produtos: boolean
  notificar_vendas: boolean
  notificar_comissoes: boolean
  periodo_saque: 'semanal' | 'quinzenal' | 'mensal'
  valor_minimo_saque: number
}

export type VendorMetricas = {
  total_produtos: number
  total_vendas: number
  receita_total: number
  comissao_pendente: number
  avaliacao_media: number
  total_avaliacoes: number
  produtos_aprovados: number
  produtos_pendentes: number
}

export type ProdutoMarketplace = Produto & {
  vendor_id: string
  aprovado: boolean
  aprovado_por?: string
  data_aprovacao?: string
  motivo_rejeicao?: string
  moderacao_status: 'pendente' | 'aprovado' | 'rejeitado' | 'revisao'
  vendas_totais: number
  estoque_disponivel: number
  estoque_minimo: number
  peso?: number // para cálculo de frete
  dimensoes?: {
    altura: number
    largura: number
    profundidade: number
  }
  origem: 'admin' | 'vendor' // quem criou o produto
  destaque: boolean // produto em destaque no marketplace
  expand?: Produto['expand'] & {
    vendor?: Vendor
    avaliacoes?: ProdutoAvaliacao[]
  }
}

export type Comissao = {
  id: string
  vendor_id: string
  pedido_id: string
  produto_id: string
  valor_venda: number
  percentual_comissao: number
  valor_comissao: number
  status: 'pendente' | 'liberada' | 'paga' | 'cancelada'
  data_liberacao?: string
  data_pagamento?: string
  forma_pagamento?: 'pix' | 'ted' | 'doc'
  comprovante_pagamento?: string
  observacoes?: string
  cliente: string // tenant_id
  created: string
  updated: string
  expand?: {
    vendor?: Vendor
    pedido?: Pedido
    produto?: ProdutoMarketplace
  }
}

export type SaqueComissao = {
  id: string
  vendor_id: string
  valor_solicitado: number
  comissoes_ids: string[]
  status: 'solicitado' | 'processando' | 'pago' | 'cancelado'
  data_solicitacao: string
  data_processamento?: string
  data_pagamento?: string
  comprovante?: string
  taxa_saque?: number
  valor_liquido?: number
  observacoes?: string
  processado_por?: string
  cliente: string
  created: string
  updated: string
  expand?: {
    vendor?: Vendor
    comissoes?: Comissao[]
  }
}

export type ProdutoAvaliacao = {
  id: string
  produto_id: string
  cliente_id: string
  pedido_id: string
  nota: number // 1-5
  comentario?: string
  data_compra: string
  verificada: boolean // compra verificada
  resposta_vendor?: string
  data_resposta?: string
  status: 'ativa' | 'moderada' | 'removida'
  denuncias?: number
  cliente: string
  created: string
  updated: string
  expand?: {
    produto?: ProdutoMarketplace
    cliente_usuario?: {
      id: string
      nome: string
    }
  }
}

export type MarketplaceConfig = {
  id: string
  cliente: string
  habilitado: boolean
  comissao_padrao: number
  valor_minimo_saque: number
  taxa_saque: number
  periodo_retencao_dias: number // período antes de liberar comissão
  moderacao_produtos: boolean
  auto_aprovar_vendors: boolean
  categorias_permitidas: string[]
  formas_pagamento_comissao: ('pix' | 'ted' | 'doc')[]
  configuracoes_email: {
    notificar_novo_vendor: boolean
    notificar_novo_produto: boolean
    notificar_venda: boolean
  }
  termos_uso_vendor?: string
  politica_comissao?: string
  created: string
  updated: string
}

export type VendorAnalytics = {
  id: string
  vendor_id: string
  periodo: string // YYYY-MM
  vendas_quantidade: number
  vendas_valor: number
  comissao_valor: number
  produtos_cadastrados: number
  produtos_aprovados: number
  visualizacoes_produtos: number
  conversao_taxa: number // %
  ticket_medio: number
  avaliacoes_recebidas: number
  nota_media: number
  cliente: string
  created: string
  updated: string
}

// Cache de produtos para performance
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

// Sistema de denúncias
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

// Notificações para vendors
export type VendorNotificacao = {
  id: string
  vendor_id: string
  tipo: 'nova_venda' | 'produto_aprovado' | 'produto_rejeitado' | 'comissao_liberada' | 'saque_processado'
  titulo: string
  mensagem: string
  lida: boolean
  link?: string
  dados_extras?: Record<string, any>
  cliente: string
  created: string
}

// Queue jobs para processamento assíncrono
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

// Relatórios do marketplace
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