// Tipos para estrutura hierárquica territorial
export type NivelHierarquia = 'coordenador_geral' | 'coordenador_regional' | 'lider_local'

export type Estado = {
  id: string
  nome: string
  codigo: string // Ex: 'SP', 'RJ', 'MG'
  coordenador_geral: string // ID do usuário coordenador geral
  ativo: boolean
  configuracoes: EstadoConfiguracoes
  metricas?: EstadoMetricas
  created: string
  updated: string
}

export type Regiao = {
  id: string
  nome: string
  estado_id: string
  coordenador_regional: string // ID do usuário coordenador regional
  cidades: string[] // IDs das cidades desta região
  ativo: boolean
  configuracoes: RegiaoConfiguracoes
  metricas?: RegiaoMetricas
  created: string
  updated: string
  expand?: {
    estado?: Estado
    cidades?: Cidade[]
    coordenador?: Usuario
  }
}

export type Cidade = {
  id: string
  nome: string
  estado_id: string
  regiao_id?: string
  lider_local: string // ID do usuário líder local
  ativo: boolean
  configuracoes: CidadeConfiguracoes
  metricas?: CidadeMetricas
  created: string
  updated: string
  expand?: {
    estado?: Estado
    regiao?: Regiao
    lider?: Usuario
  }
}

export type Usuario = {
  id: string
  nome: string
  email: string
  telefone: string
  documento: string
  nivel_hierarquia: NivelHierarquia
  estado_id?: string
  regiao_id?: string
  cidade_id?: string
  permissoes: UsuarioPermissoes
  status: 'ativo' | 'suspenso' | 'pendente_aprovacao'
  created: string
  updated: string
  expand?: {
    estado?: Estado
    regiao?: Regiao
    cidade?: Cidade
  }
}

export type EstadoConfiguracoes = {
  comissao_coordenador_geral: number // % que o coordenador geral recebe
  comissao_coordenador_regional: number // % que coordenadores regionais recebem
  comissao_lider_local: number // % que líderes locais recebem
  auto_aprovar_lideres: boolean
  requer_aprovacao_produtos: boolean
  valor_minimo_pedido: number
}

export type RegiaoConfiguracoes = {
  override_comissoes?: boolean // Se true, usa comissões específicas da região
  comissao_coordenador_regional?: number
  comissao_lider_local?: number
  meta_mensal_vendas?: number
  auto_aprovar_produtos?: boolean
}

export type CidadeConfiguracoes = {
  override_comissoes?: boolean
  comissao_lider_local?: number
  meta_mensal_vendas?: number
  meta_mensal_inscricoes?: number
}

export type UsuarioPermissoes = {
  // Permissões de visualização
  ver_todos_estados?: boolean // Apenas coordenador geral
  ver_estado?: boolean // Coordenador geral e regional do estado
  ver_regiao?: boolean // Coordenador regional e líderes da região
  ver_cidade?: boolean // Líder local da cidade
  
  // Permissões de gestão
  gerenciar_coordenadores_regionais?: boolean // Apenas coordenador geral
  gerenciar_lideres_locais?: boolean // Coordenador geral e regional
  aprovar_produtos?: boolean
  gerenciar_comissoes?: boolean
  
  // Permissões de vendas
  criar_produtos?: boolean
  vender_produtos?: boolean
  gerenciar_inscricoes?: boolean
  
  // Permissões financeiras
  ver_financeiro_completo?: boolean // Coordenador geral
  ver_financeiro_estado?: boolean // Coordenador geral e regional
  ver_financeiro_regiao?: boolean // Coordenador regional e líderes
  ver_financeiro_cidade?: boolean // Líder local
  
  processar_saques?: boolean
  liberar_comissoes?: boolean
}

export type EstadoMetricas = {
  total_regioes: number
  total_cidades: number
  total_lideres: number
  total_produtos: number
  total_vendas_mes: number
  receita_total_mes: number
  comissao_coordenador_mes: number
  meta_cumprida: boolean
}

export type RegiaoMetricas = {
  total_cidades: number
  total_lideres: number
  total_produtos: number
  total_vendas_mes: number
  receita_total_mes: number
  comissao_coordenador_mes: number
  meta_cumprida: boolean
}

export type CidadeMetricas = {
  total_lideres: number
  total_produtos: number
  total_vendas_mes: number
  total_inscricoes_mes: number
  receita_total_mes: number
  comissao_lider_mes: number
  meta_vendas_cumprida: boolean
  meta_inscricoes_cumprida: boolean
}

// Marketplace adaptado para hierarquia
export type VendorHierarquico = {
  id: string
  nome: string
  documento: string
  email: string
  telefone: string
  endereco: VendorEndereco
  status: 'ativo' | 'suspenso' | 'pendente_aprovacao' | 'rejeitado'
  
  // Hierarquia territorial
  estado_id: string
  regiao_id?: string
  cidade_id?: string
  nivel_atuacao: 'estado' | 'regiao' | 'cidade' // Onde o vendor atua
  
  // Sistema de comissões hierárquico
  comissao_vendor: number // % do vendor
  comissao_lider: number // % do líder local
  comissao_coordenador_regional: number // % do coordenador regional
  comissao_coordenador_geral: number // % do coordenador geral
  
  conta_bancaria: ContaBancaria
  documentos_verificacao: string[]
  aprovado_por?: string
  data_aprovacao?: string
  
  configuracoes: VendorConfiguracoes
  metricas?: VendorMetricas
  created: string
  updated: string
  
  expand?: {
    estado?: Estado
    regiao?: Regiao
    cidade?: Cidade
    aprovador?: Usuario
  }
}

export type ComissaoHierarquica = {
  id: string
  pedido_id: string
  produto_id: string
  vendor_id: string
  
  // Valores da venda
  valor_venda: number
  valor_produto: number // Valor base do produto
  
  // Comissões por nível
  comissao_vendor: number
  comissao_lider_local: number
  comissao_coordenador_regional: number
  comissao_coordenador_geral: number
  
  // Percentuais aplicados
  percentual_vendor: number
  percentual_lider: number
  percentual_coordenador_regional: number
  percentual_coordenador_geral: number
  
  // IDs dos beneficiários
  vendor_id_beneficiario: string
  lider_id_beneficiario?: string
  coordenador_regional_id_beneficiario?: string
  coordenador_geral_id_beneficiario?: string
  
  // Hierarquia territorial
  estado_id: string
  regiao_id?: string
  cidade_id?: string
  
  status: 'pendente' | 'liberada' | 'paga' | 'cancelada'
  data_liberacao?: string
  data_pagamento?: string
  
  created: string
  updated: string
  
  expand?: {
    vendor?: VendorHierarquico
    lider?: Usuario
    coordenador_regional?: Usuario
    coordenador_geral?: Usuario
    estado?: Estado
    regiao?: Regiao
    cidade?: Cidade
  }
}

export type ProdutoHierarquico = {
  id: string
  nome: string
  descricao: string
  preco: number
  imagens: string[]
  categoria: string
  
  // Hierarquia e permissões
  criado_por: string // ID do usuário que criou
  nivel_criador: NivelHierarquia
  estado_id: string
  regiao_id?: string
  cidade_id?: string
  
  // Disponibilidade territorial
  disponivel_estado_inteiro: boolean
  disponivel_regioes?: string[] // IDs das regiões onde está disponível
  disponivel_cidades?: string[] // IDs das cidades onde está disponível
  
  // Moderação
  aprovado: boolean
  aprovado_por?: string
  moderacao_status: 'pendente' | 'aprovado' | 'rejeitado'
  motivo_rejeicao?: string
  
  // Estoque por localização
  estoque_por_cidade?: Record<string, number> // cidade_id: quantidade
  estoque_por_regiao?: Record<string, number> // regiao_id: quantidade
  estoque_estado?: number
  
  ativo: boolean
  created: string
  updated: string
  
  expand?: {
    criador?: Usuario
    estado?: Estado
    regiao?: Regiao
    cidade?: Cidade
  }
}

// Relatórios hierárquicos
export type RelatorioHierarquico = {
  id: string
  tipo: 'vendas_estado' | 'vendas_regiao' | 'vendas_cidade' | 'comissoes_hierarquia' | 'performance_lideres'
  
  // Filtros territoriais
  estado_id?: string
  regiao_id?: string
  cidade_id?: string
  
  // Período
  periodo_inicio: string
  periodo_fim: string
  
  // Dados do relatório
  dados: {
    resumo_geral: any
    detalhamento_por_nivel: any
    comparativo_periodos?: any
    metas_vs_realizado?: any
  }
  
  solicitado_por: string
  nivel_solicitante: NivelHierarquia
  
  status: 'processando' | 'concluido' | 'erro'
  arquivo_url?: string
  
  created: string
  updated: string
}

// Dashboard por nível hierárquico
export type DashboardData = {
  nivel_usuario: NivelHierarquia
  periodo: string
  
  // Métricas do nível atual
  metricas_nivel: {
    vendas_quantidade: number
    vendas_valor: number
    comissoes_recebidas: number
    produtos_ativos: number
    lideres_ativos?: number
  }
  
  // Métricas dos níveis subordinados
  metricas_subordinados?: {
    total_regioes?: number
    total_cidades?: number
    total_lideres?: number
    performance_por_regiao?: Array<{
      regiao_id: string
      nome: string
      vendas: number
      meta: number
      percentual_meta: number
    }>
    performance_por_cidade?: Array<{
      cidade_id: string
      nome: string
      vendas: number
      meta: number
      percentual_meta: number
    }>
  }
  
  // Comparações e rankings
  ranking_performance?: Array<{
    id: string
    nome: string
    nivel: NivelHierarquia
    vendas: number
    comissoes: number
    posicao: number
  }>
  
  // Alertas e notificações
  alertas?: Array<{
    tipo: 'meta_baixa' | 'sem_vendas' | 'estoque_baixo' | 'aprovacao_pendente'
    mensagem: string
    nivel_urgencia: 'baixa' | 'media' | 'alta'
    link_acao?: string
  }>
}

// Tipos para controle de acesso baseado em hierarquia
export type ControleAcesso = {
  usuario_id: string
  nivel: NivelHierarquia
  estado_id?: string
  regiao_id?: string
  cidade_id?: string
  pode_acessar: (recurso: string, acao: string, contexto?: any) => boolean
}