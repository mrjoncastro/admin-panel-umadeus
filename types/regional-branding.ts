// Sistema de identidade visual regional
export type IdentidadeVisualRegional = {
  id: string
  regiao_id: string
  nome_fantasia?: string // Nome comercial da região
  
  // Cores principais (dentro de paleta aprovada)
  cores: {
    primaria: string // Cor principal da região
    secundaria: string // Cor de apoio
    acento: string // Cor de destaque
    texto_primario: string // Cor do texto principal
    texto_secundario: string // Cor do texto secundário
    fundo_principal: string // Cor de fundo
    fundo_secundario: string // Cor de fundo alternativa
  }
  
  // Logotipo e elementos visuais
  logos: {
    principal: string // Logo principal da região
    horizontal: string // Versão horizontal
    simbolo: string // Apenas símbolo
    monocromatico: string // Versão monocromática
    favicon: string // Favicon personalizado
  }
  
  // Tipografia (dentro de opções aprovadas)
  tipografia: {
    fonte_primaria: FonteAprovada
    fonte_secundaria: FonteAprovada
    tamanhos: TamanhosTexto
  }
  
  // Elementos customizáveis
  elementos: {
    banner_hero?: string // Banner principal da região
    imagens_destaque?: string[] // Imagens para carousel/destaque
    icones_customizados?: Record<string, string> // Ícones específicos da região
    padroes_fundo?: string[] // Padrões de fundo aprovados
  }
  
  // Configurações de layout
  layout: {
    estilo_navbar: 'minimal' | 'completo' | 'compacto'
    posicao_logo: 'esquerda' | 'centro' | 'direita'
    estilo_botoes: 'rounded' | 'square' | 'pill'
    estilo_cards: 'flat' | 'shadow' | 'bordered'
    espacamento: 'compacto' | 'normal' | 'amplo'
  }
  
  // Metadados e controle
  status: 'ativo' | 'rascunho' | 'aprovacao_pendente' | 'rejeitado'
  aprovado_por?: string
  data_aprovacao?: string
  versao: number
  observacoes_aprovacao?: string
  
  // Padrões corporativos (não editáveis pela região)
  restricoes: {
    paleta_cores_aprovadas: string[]
    fontes_permitidas: FonteAprovada[]
    elementos_obrigatorios: string[]
    proporcoes_logo: LogoProporcoes
  }
  
  created: string
  updated: string
}

export type FonteAprovada = {
  nome: string
  familia: string
  variantes: ('normal' | 'bold' | 'italic' | 'bold-italic')[]
  google_font?: boolean
  arquivo_font?: string
}

export type TamanhosTexto = {
  h1: string
  h2: string
  h3: string
  h4: string
  body: string
  small: string
  caption: string
}

export type LogoProporcoes = {
  altura_minima: number
  altura_maxima: number
  largura_minima: number
  largura_maxima: number
  margem_seguranca: number
}

// Template de identidade regional
export type TemplateRegional = {
  id: string
  nome: string
  descricao: string
  categoria: 'corporativo' | 'moderno' | 'classico' | 'jovem' | 'elegante'
  preview_image: string
  
  // Configurações pré-definidas
  cores_padrao: IdentidadeVisualRegional['cores']
  layout_padrao: IdentidadeVisualRegional['layout']
  tipografia_padrao: IdentidadeVisualRegional['tipografia']
  
  // Elementos inclusos
  elementos_inclusos: string[]
  
  // Popularidade e uso
  usado_por_regioes: number
  avaliacao_media: number
  
  ativo: boolean
  created: string
}

// Configurações de marca corporativa (imutáveis)
export type MarcaCorporativa = {
  id: string
  nome_empresa: string
  
  // Elementos corporativos obrigatórios
  logo_corporativo: string
  cores_corporativas: {
    primaria: string
    secundaria: string
    neutras: string[]
  }
  
  // Diretrizes de marca
  diretrizes: {
    uso_logo_obrigatorio: boolean
    posicionamento_logo: 'header' | 'footer' | 'ambos'
    tamanho_minimo_logo: number
    espacamento_minimo_logo: number
    cores_proibidas: string[]
    combinacoes_proibidas: Array<{ cor1: string; cor2: string }>
  }
  
  // Assets corporativos
  assets: {
    manual_marca: string
    templates_aprovados: string[]
    icones_corporativos: Record<string, string>
    padroes_aprovados: string[]
  }
  
  // Compliance e legal
  compliance: {
    disclaimer_obrigatorio: string
    informacoes_legais: string[]
    certificacoes_exibir: string[]
  }
}

// Sistema de aprovação de design
export type AprovacaoDesign = {
  id: string
  identidade_visual_id: string
  regiao_id: string
  solicitante_id: string
  
  // Alterações propostas
  alteracoes: {
    tipo: 'cores' | 'logos' | 'tipografia' | 'layout' | 'elementos'
    antes: any
    depois: any
    justificativa: string
  }[]
  
  // Processo de aprovação
  status: 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado' | 'revisao_necessaria'
  analisado_por?: string
  data_analise?: string
  comentarios_aprovador?: string
  
  // Compliance check
  compliance_check: {
    cores_em_paleta: boolean
    logo_proporcoes_ok: boolean
    elementos_obrigatorios_presentes: boolean
    restricoes_respeitadas: boolean
    score_qualidade: number // 0-100
  }
  
  created: string
  updated: string
}

// Configurações de tema dinâmico
export type TemaDinamico = {
  regiao_id: string
  identidade_ativa: string
  
  // CSS customizado gerado
  css_customizado: string
  css_hash: string // Para cache
  
  // Variáveis CSS
  css_variables: Record<string, string>
  
  // Assets otimizados
  assets_otimizados: {
    logos_webp: Record<string, string>
    icones_svg: Record<string, string>
    fontes_woff2: Record<string, string>
  }
  
  // Performance
  cache_key: string
  ultima_atualizacao: string
  versao_assets: number
}

// Analytics de identidade visual
export type AnalyticsIdentidade = {
  id: string
  regiao_id: string
  periodo: string // YYYY-MM
  
  // Métricas de engagement
  metricas: {
    tempo_permanencia_medio: number
    taxa_rejeicao: number
    paginas_por_sessao: number
    conversao_vendas: number
    satisfacao_usuario: number
  }
  
  // Comparativo com outras regiões
  comparativo: {
    posicao_ranking: number
    score_vs_media: number
    melhor_elemento: string
    elemento_melhorar: string
  }
  
  // Feedback dos usuários
  feedback: {
    total_avaliacoes: number
    nota_media: number
    comentarios_positivos: string[]
    sugestoes_melhoria: string[]
  }
  
  created: string
}

// Paleta de cores corporativa aprovada
export type PaletaCoresAprovada = {
  categoria: 'primaria' | 'secundaria' | 'acento' | 'neutra' | 'especial'
  cores: Array<{
    nome: string
    hex: string
    rgb: { r: number; g: number; b: number }
    hsl: { h: number; s: number; l: number }
    uso_recomendado: string[]
    acessibilidade_score: number
    combina_com: string[]
  }>
  aplicacao: string[]
  restricoes: string[]
}

// Sistema de preview e teste A/B
export type PreviewIdentidade = {
  id: string
  regiao_id: string
  identidade_teste_id: string
  
  // Configuração do teste
  porcentagem_usuarios: number // % de usuários que veem o teste
  duracao_teste_dias: number
  metricas_acompanhar: string[]
  
  // Resultados
  resultados: {
    usuarios_teste: number
    usuarios_controle: number
    diferenca_conversao: number
    significancia_estatistica: number
    vencedor: 'teste' | 'controle' | 'empate'
  }
  
  status: 'ativo' | 'concluido' | 'pausado'
  data_inicio: string
  data_fim?: string
}

// Editor visual para regiões
export type EditorVisualConfig = {
  regiao_id: string
  usuario_id: string
  
  // Permissões de edição
  permissoes: {
    editar_cores: boolean
    editar_logos: boolean
    editar_tipografia: boolean
    editar_layout: boolean
    solicitar_aprovacao: boolean
  }
  
  // Histórico de alterações
  historico: Array<{
    data: string
    usuario: string
    alteracao: string
    antes: any
    depois: any
  }>
  
  // Configurações do editor
  configuracoes: {
    modo_edicao: 'basico' | 'avancado' | 'especialista'
    mostrar_diretrizes: boolean
    preview_tempo_real: boolean
    salvar_automatico: boolean
  }
}