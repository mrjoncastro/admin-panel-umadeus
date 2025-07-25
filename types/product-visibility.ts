import type { NivelHierarquia } from './hierarchy'

// Níveis de visibilidade de produtos
export type NivelVisibilidade = 
  | 'cidade'        // Apenas na cidade do líder
  | 'regiao'        // Toda a região (precisa aprovação regional)
  | 'estado'        // Todo o estado (precisa aprovação estadual)
  | 'nacional'      // Todo o país (automático para coord. geral)

// Status de autorização para visibilidade
export type StatusAutorizacao = 
  | 'pendente'      // Aguardando aprovação
  | 'aprovado'      // Aprovado para o nível solicitado
  | 'rejeitado'     // Rejeitado
  | 'automatico'    // Aprovação automática (coord. geral)

// Produto com controle de visibilidade
export type ProdutoVisibilidade = {
  id: string
  produto_id: string
  criado_por: string           // ID do usuário que criou
  nivel_criador: NivelHierarquia // Nível hierárquico do criador
  
  // Controle de visibilidade
  nivel_visibilidade_solicitado: NivelVisibilidade
  nivel_visibilidade_atual: NivelVisibilidade
  status_autorizacao: StatusAutorizacao
  
  // Aprovações necessárias
  aprovacao_regional?: {
    necessaria: boolean
    status: StatusAutorizacao
    aprovado_por?: string
    data_aprovacao?: string
    comentarios?: string
  }
  
  aprovacao_estadual?: {
    necessaria: boolean
    status: StatusAutorizacao
    aprovado_por?: string
    data_aprovacao?: string
    comentarios?: string
  }
  
  // Localização e escopo
  estado_id: string
  regiao_id: string
  cidade_id: string
  
  // Controle de território de exibição
  territorios_visiveis: {
    estados: string[]     // Estados onde o produto é visível
    regioes: string[]     // Regiões onde o produto é visível
    cidades: string[]     // Cidades onde o produto é visível
  }
  
  // Métricas de visibilidade
  metricas: {
    visualizacoes_por_territorio: Record<string, number>
    conversoes_por_territorio: Record<string, number>
    receita_por_territorio: Record<string, number>
  }
  
  // Auditoria
  historico_aprovacoes: AprovacaoHistorico[]
  
  created: string
  updated: string
}

// Histórico de aprovações
export type AprovacaoHistorico = {
  id: string
  tipo: 'criacao' | 'solicitacao_aprovacao' | 'aprovacao' | 'rejeicao' | 'alteracao_nivel'
  nivel_anterior?: NivelVisibilidade
  nivel_solicitado: NivelVisibilidade
  solicitante_id: string
  aprovador_id?: string
  comentarios?: string
  data: string
}

// Solicitação de aprovação de visibilidade
export type SolicitacaoAprovacao = {
  id: string
  produto_id: string
  produto_visibilidade_id: string
  
  // Solicitação
  solicitante_id: string
  nivel_atual: NivelVisibilidade
  nivel_solicitado: NivelVisibilidade
  justificativa: string
  
  // Aprovação
  aprovador_necessario: NivelHierarquia // 'coordenador_regional' | 'coordenador_geral'
  status: StatusAutorizacao
  aprovado_por?: string
  data_aprovacao?: string
  comentarios_aprovador?: string
  
  // Dados do produto para análise
  produto_info: {
    nome: string
    categoria: string
    preco: number
    vendedor: string
    performance_atual: {
      vendas_ultimo_mes: number
      avaliacao_media: number
      total_avaliacoes: number
    }
  }
  
  created: string
  updated: string
}

// Configurações de auto-aprovação
export type ConfiguracaoAutoAprovacao = {
  id: string
  regiao_id?: string
  estado_id?: string
  
  // Critérios para aprovação automática
  criterios: {
    nota_minima_produto: number        // Nota mínima do produto
    vendas_minimas_mes: number         // Vendas mínimas no último mês
    avaliacao_vendedor_minima: number  // Avaliação mínima do vendedor
    sem_denuncias_dias: number         // Dias sem denúncias
  }
  
  // Níveis que podem ser auto-aprovados
  auto_aprovacao_para: NivelVisibilidade[]
  
  // Limites
  limite_produtos_por_vendedor_mes: number
  limite_produtos_pendentes_simultaneos: number
  
  ativo: boolean
  created: string
  updated: string
}

// Relatório de produtos por visibilidade
export type RelatorioVisibilidadeProdutos = {
  id: string
  periodo: string // YYYY-MM
  territorio_id: string
  tipo_territorio: 'estado' | 'regiao' | 'cidade'
  
  // Estatísticas de produtos
  produtos_por_nivel: Record<NivelVisibilidade, number>
  produtos_pendentes_aprovacao: number
  produtos_rejeitados_mes: number
  
  // Performance por nível
  performance_por_nivel: Record<NivelVisibilidade, {
    total_vendas: number
    receita_total: number
    avaliacao_media: number
    produtos_top_10: string[]
  }>
  
  // Aprovações
  aprovacoes_mes: {
    solicitadas: number
    aprovadas: number
    rejeitadas: number
    tempo_medio_aprovacao: number // em horas
  }
  
  // Top produtos por alcance
  produtos_maior_alcance: Array<{
    produto_id: string
    nome: string
    nivel_visibilidade: NivelVisibilidade
    territorios_ativos: number
    vendas_total: number
  }>
  
  created: string
}

// Filtros de busca por visibilidade
export type FiltrosProdutoVisibilidade = {
  nivel_visibilidade?: NivelVisibilidade[]
  status_autorizacao?: StatusAutorizacao[]
  criado_por?: string
  nivel_criador?: NivelHierarquia[]
  estado_id?: string
  regiao_id?: string
  cidade_id?: string
  data_inicio?: string
  data_fim?: string
  pendente_aprovacao_usuario?: string // Produtos pendentes de aprovação por este usuário
}

// Dashboard de aprovações
export type DashboardAprovacoes = {
  usuario_id: string
  nivel_hierarquia: NivelHierarquia
  
  // Contadores
  pendentes_aprovacao: number
  aprovadas_hoje: number
  rejeitadas_hoje: number
  aguardando_resposta: number
  
  // Produtos por status
  produtos_por_status: Record<StatusAutorizacao, number>
  
  // Performance de aprovações
  tempo_medio_aprovacao: number
  taxa_aprovacao: number // % de aprovações vs rejeições
  
  // Produtos mais solicitados para aprovação
  produtos_mais_solicitados: Array<{
    produto_id: string
    nome: string
    total_solicitacoes: number
    ultima_solicitacao: string
  }>
  
  // Vendedores com mais solicitações
  vendedores_mais_ativos: Array<{
    vendedor_id: string
    nome: string
    solicitacoes_pendentes: number
    taxa_aprovacao_historica: number
  }>
  
  data_atualizacao: string
}

// Notificação de aprovação
export type NotificacaoAprovacao = {
  id: string
  usuario_id: string
  tipo: 'nova_solicitacao' | 'produto_aprovado' | 'produto_rejeitado' | 'nivel_alterado'
  
  // Dados da notificação
  produto_id: string
  produto_nome: string
  solicitacao_id?: string
  nivel_anterior?: NivelVisibilidade
  nivel_novo?: NivelVisibilidade
  aprovador_nome?: string
  comentarios?: string
  
  // Estado
  lida: boolean
  data_leitura?: string
  
  created: string
}

// Regras de negócio para visibilidade
export type RegraVisibilidade = {
  // Mapeamento de quem pode aprovar o quê
  aprovadores: {
    [K in NivelVisibilidade]: NivelHierarquia[]
  }
  
  // Visibilidade automática por nível do criador
  visibilidade_automatica: {
    [K in NivelHierarquia]: NivelVisibilidade[]
  }
  
  // Limite de produtos pendentes por usuário
  limites_usuario: {
    [K in NivelHierarquia]: number
  }
  
  // Tempo máximo para aprovação (em horas)
  tempo_maximo_aprovacao: {
    [K in NivelVisibilidade]: number
  }
}

// Configuração padrão das regras
export const REGRAS_VISIBILIDADE_DEFAULT: RegraVisibilidade = {
  aprovadores: {
    cidade: [], // Não precisa aprovação
    regiao: ['coordenador_regional'], // Coordenador regional aprova
    estado: ['coordenador_geral'], // Coordenador geral aprova
    nacional: ['coordenador_geral'] // Coordenador geral aprova
  },
  
  visibilidade_automatica: {
    lider_local: ['cidade'], // Líder pode publicar direto na cidade
    coordenador_regional: ['cidade', 'regiao'], // Regional pode publicar direto na região
    coordenador_geral: ['cidade', 'regiao', 'estado', 'nacional'] // Geral pode tudo
  },
  
  limites_usuario: {
    lider_local: 10, // Máximo 10 produtos pendentes
    coordenador_regional: 25, // Máximo 25 produtos pendentes
    coordenador_geral: 100 // Máximo 100 produtos pendentes
  },
  
  tempo_maximo_aprovacao: {
    cidade: 0, // Imediato
    regiao: 24, // 24 horas
    estado: 48, // 48 horas
    nacional: 72 // 72 horas
  }
}