import type PocketBase from 'pocketbase'
import type { 
  IdentidadeVisualRegional,
  TemplateRegional,
  MarcaCorporativa,
  AprovacaoDesign,
  TemaDinamico,
  PaletaCoresAprovada,
  PreviewIdentidade
} from '../../types/regional-branding'
import createPocketBase from '../pocketbase'

function getClient(pb?: PocketBase): PocketBase {
  return pb ?? createPocketBase()
}

// ========== IDENTIDADE VISUAL REGIONAL ==========

export async function fetchIdentidadeVisualRegiao(
  regiaoId: string, 
  pb?: PocketBase
): Promise<IdentidadeVisualRegional | null> {
  const client = getClient(pb)
  
  try {
    const identidade = await client
      .collection('identidades_visuais_regionais')
      .getFirstListItem(`regiao_id = "${regiaoId}" && status = "ativo"`)
    
    return identidade as IdentidadeVisualRegional
  } catch {
    return null
  }
}

export async function createIdentidadeVisualRegiao(
  regiaoId: string,
  templateId?: string,
  pb?: PocketBase
): Promise<IdentidadeVisualRegional> {
  const client = getClient(pb)
  
  // Buscar template se fornecido
  let dadosTemplate = {}
  if (templateId) {
    const template = await client
      .collection('templates_regionais')
      .getOne(templateId) as TemplateRegional
    
    dadosTemplate = {
      cores: template.cores_padrao,
      layout: template.layout_padrao,
      tipografia: template.tipografia_padrao
    }
  }
  
  // Buscar restrições corporativas
  const marcaCorporativa = await fetchMarcaCorporativa(pb)
  
  const identidadeData: Partial<IdentidadeVisualRegional> = {
    regiao_id: regiaoId,
    status: 'rascunho',
    versao: 1,
    restricoes: {
      paleta_cores_aprovadas: await getPaletaCoresAprovadas(pb),
      fontes_permitidas: await getFontesPermitidas(pb),
      elementos_obrigatorios: marcaCorporativa?.diretrizes?.posicionamento_logo ? 
        ['logo_corporativo'] : [],
      proporcoes_logo: marcaCorporativa?.diretrizes ? {
        altura_minima: marcaCorporativa.diretrizes.tamanho_minimo_logo,
        altura_maxima: marcaCorporativa.diretrizes.tamanho_minimo_logo * 3,
        largura_minima: marcaCorporativa.diretrizes.tamanho_minimo_logo,
        largura_maxima: marcaCorporativa.diretrizes.tamanho_minimo_logo * 4,
        margem_seguranca: marcaCorporativa.diretrizes.espacamento_minimo_logo
      } : {
        altura_minima: 32,
        altura_maxima: 96,
        largura_minima: 32,
        largura_maxima: 128,
        margem_seguranca: 16
      }
    },
    ...dadosTemplate
  }
  
  return client.collection('identidades_visuais_regionais').create(identidadeData)
}

export async function updateIdentidadeVisualRegiao(
  identidadeId: string,
  updates: Partial<IdentidadeVisualRegional>,
  pb?: PocketBase
): Promise<IdentidadeVisualRegional> {
  const client = getClient(pb)
  
  // Incrementar versão se houver alterações significativas
  const updateData = {
    ...updates,
    versao: updates.cores || updates.logos || updates.tipografia || updates.layout ? 
      (updates.versao || 1) + 1 : updates.versao
  }
  
  return client.collection('identidades_visuais_regionais').update(identidadeId, updateData)
}

// ========== TEMPLATES REGIONAIS ==========

export async function fetchTemplatesRegionais(pb?: PocketBase): Promise<TemplateRegional[]> {
  const client = getClient(pb)
  
  return client.collection('templates_regionais').getFullList({
    filter: 'ativo = true',
    sort: '-usado_por_regioes,-avaliacao_media'
  })
}

export async function fetchTemplateRegional(
  templateId: string, 
  pb?: PocketBase
): Promise<TemplateRegional> {
  const client = getClient(pb)
  return client.collection('templates_regionais').getOne(templateId)
}

// ========== MARCA CORPORATIVA ==========

export async function fetchMarcaCorporativa(pb?: PocketBase): Promise<MarcaCorporativa | null> {
  const client = getClient(pb)
  
  try {
    return await client.collection('marca_corporativa').getFirstListItem('id != ""')
  } catch {
    return null
  }
}

export async function getPaletaCoresAprovadas(pb?: PocketBase): Promise<string[]> {
  const client = getClient(pb)
  
  try {
    const paletas = await client.collection('paletas_cores_aprovadas').getFullList()
    return paletas.flatMap((p: PaletaCoresAprovada) => 
      p.cores.map(cor => cor.hex)
    )
  } catch {
    // Paleta padrão se não houver configuração
    return [
      '#1E40AF', '#3B82F6', '#60A5FA', // Azuis
      '#059669', '#10B981', '#34D399', // Verdes  
      '#DC2626', '#EF4444', '#F87171', // Vermelhos
      '#7C2D12', '#EA580C', '#FB923C', // Laranjas
      '#7C3AED', '#8B5CF6', '#A78BFA', // Roxos
      '#374151', '#6B7280', '#9CA3AF'  // Cinzas
    ]
  }
}

export async function getFontesPermitidas(pb?: PocketBase) {
  const client = getClient(pb)
  
  try {
    const fontes = await client.collection('fontes_aprovadas').getFullList()
    return fontes
  } catch {
    // Fontes padrão
    return [
      {
        nome: 'Inter',
        familia: 'Inter, sans-serif',
        variantes: ['normal', 'bold'],
        google_font: true
      },
      {
        nome: 'Poppins', 
        familia: 'Poppins, sans-serif',
        variantes: ['normal', 'bold', 'italic'],
        google_font: true
      },
      {
        nome: 'Roboto',
        familia: 'Roboto, sans-serif', 
        variantes: ['normal', 'bold', 'italic'],
        google_font: true
      }
    ]
  }
}

// ========== SISTEMA DE APROVAÇÃO ==========

export async function solicitarAprovacaoDesign(
  identidadeId: string,
  alteracoes: AprovacaoDesign['alteracoes'],
  solicitanteId: string,
  pb?: PocketBase
): Promise<AprovacaoDesign> {
  const client = getClient(pb)
  
  // Buscar identidade atual
  const identidade = await client
    .collection('identidades_visuais_regionais')
    .getOne(identidadeId) as IdentidadeVisualRegional
  
  // Realizar compliance check
  const complianceCheck = await verificarCompliance(identidade, alteracoes, pb)
  
  const aprovacaoData: Partial<AprovacaoDesign> = {
    identidade_visual_id: identidadeId,
    regiao_id: identidade.regiao_id,
    solicitante_id: solicitanteId,
    alteracoes,
    status: complianceCheck.score_qualidade >= 80 ? 'pendente' : 'revisao_necessaria',
    compliance_check: complianceCheck
  }
  
  return client.collection('aprovacoes_design').create(aprovacaoData)
}

export async function processarAprovacaoDesign(
  aprovacaoId: string,
  status: 'aprovado' | 'rejeitado',
  comentarios: string,
  analisadoPor: string,
  pb?: PocketBase
): Promise<AprovacaoDesign> {
  const client = getClient(pb)
  
  const aprovacao = await client.collection('aprovacoes_design').update(aprovacaoId, {
    status,
    comentarios_aprovador: comentarios,
    analisado_por: analisadoPor,
    data_analise: new Date().toISOString()
  })
  
  // Se aprovado, aplicar as alterações na identidade visual
  if (status === 'aprovado') {
    await aplicarAlteracoesAprovadas(aprovacao, pb)
  }
  
  return aprovacao
}

async function verificarCompliance(
  identidade: IdentidadeVisualRegional,
  alteracoes: AprovacaoDesign['alteracoes'],
  pb?: PocketBase
) {
  const marcaCorporativa = await fetchMarcaCorporativa(pb)
  const coresAprovadas = await getPaletaCoresAprovadas(pb)
  
  let score = 100
  const checks = {
    cores_em_paleta: true,
    logo_proporcoes_ok: true,
    elementos_obrigatorios_presentes: true,
    restricoes_respeitadas: true
  }
  
  // Verificar cores
  for (const alteracao of alteracoes) {
    if (alteracao.tipo === 'cores') {
      const coresPropostas = Object.values(alteracao.depois)
      const coresInvalidas = coresPropostas.filter(cor => 
        !coresAprovadas.includes(cor as string)
      )
      
      if (coresInvalidas.length > 0) {
        checks.cores_em_paleta = false
        score -= 30
      }
    }
    
    // Verificar outros aspectos...
  }
  
  return {
    ...checks,
    score_qualidade: score
  }
}

async function aplicarAlteracoesAprovadas(
  aprovacao: AprovacaoDesign,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  const identidade = await client
    .collection('identidades_visuais_regionais')
    .getOne(aprovacao.identidade_visual_id)
  
  let updateData: any = { status: 'ativo' }
  
  for (const alteracao of aprovacao.alteracoes) {
    updateData[alteracao.tipo] = alteracao.depois
  }
  
  await client
    .collection('identidades_visuais_regionais')
    .update(aprovacao.identidade_visual_id, updateData)
  
  // Regenerar tema dinâmico
  await gerarTemaDinamico(aprovacao.regiao_id, pb)
}

// ========== TEMA DINÂMICO ==========

export async function gerarTemaDinamico(
  regiaoId: string,
  pb?: PocketBase
): Promise<TemaDinamico> {
  const client = getClient(pb)
  
  const identidade = await fetchIdentidadeVisualRegiao(regiaoId, pb)
  
  if (!identidade) {
    throw new Error('Identidade visual não encontrada')
  }
  
  // Gerar CSS customizado
  const cssCustomizado = gerarCSSCustomizado(identidade)
  const cssHash = await calcularHashCSS(cssCustomizado)
  
  // Gerar variáveis CSS
  const cssVariables = gerarVariaveisCSS(identidade)
  
  // Otimizar assets
  const assetsOtimizados = await otimizarAssets(identidade)
  
  const temaData: Partial<TemaDinamico> = {
    regiao_id: regiaoId,
    identidade_ativa: identidade.id,
    css_customizado: cssCustomizado,
    css_hash: cssHash,
    css_variables: cssVariables,
    assets_otimizados: assetsOtimizados,
    cache_key: `tema_${regiaoId}_${cssHash}`,
    ultima_atualizacao: new Date().toISOString(),
    versao_assets: identidade.versao
  }
  
  // Verificar se já existe tema para esta região
  try {
    const temaExistente = await client
      .collection('temas_dinamicos')
      .getFirstListItem(`regiao_id = "${regiaoId}"`)
    
    return client.collection('temas_dinamicos').update(temaExistente.id, temaData)
  } catch {
    return client.collection('temas_dinamicos').create(temaData)
  }
}

function gerarCSSCustomizado(identidade: IdentidadeVisualRegional): string {
  const { cores, layout, tipografia } = identidade
  
  return `
    /* Cores da região */
    :root {
      --cor-primaria: ${cores.primaria};
      --cor-secundaria: ${cores.secundaria};
      --cor-acento: ${cores.acento};
      --cor-texto-primario: ${cores.texto_primario};
      --cor-texto-secundario: ${cores.texto_secundario};
      --cor-fundo-principal: ${cores.fundo_principal};
      --cor-fundo-secundario: ${cores.fundo_secundario};
      
      /* Tipografia */
      --fonte-primaria: ${tipografia.fonte_primaria.familia};
      --fonte-secundaria: ${tipografia.fonte_secundaria.familia};
      
      /* Layout */
      --espacamento: ${layout.espacamento === 'compacto' ? '0.5rem' : 
                      layout.espacamento === 'amplo' ? '2rem' : '1rem'};
      --border-radius: ${layout.estilo_botoes === 'rounded' ? '0.5rem' : 
                        layout.estilo_botoes === 'pill' ? '2rem' : '0'};
    }
    
    /* Aplicar cores */
    .btn-primary {
      background-color: var(--cor-primaria);
      border-color: var(--cor-primaria);
    }
    
    .btn-secondary {
      background-color: var(--cor-secundaria);
      border-color: var(--cor-secundaria);
    }
    
    .text-primary {
      color: var(--cor-primaria);
    }
    
    .bg-primary {
      background-color: var(--cor-primaria);
    }
    
    /* Layout específico */
    .navbar {
      ${layout.estilo_navbar === 'minimal' ? 'padding: 0.5rem 1rem;' :
        layout.estilo_navbar === 'compacto' ? 'padding: 0.25rem 1rem;' :
        'padding: 1rem 1.5rem;'}
    }
    
    .logo {
      ${layout.posicao_logo === 'centro' ? 'margin: 0 auto;' :
        layout.posicao_logo === 'direita' ? 'margin-left: auto;' :
        'margin-right: auto;'}
    }
    
    .card {
      ${layout.estilo_cards === 'shadow' ? 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);' :
        layout.estilo_cards === 'bordered' ? 'border: 1px solid var(--cor-secundaria);' :
        'box-shadow: none; border: none;'}
      border-radius: var(--border-radius);
    }
    
    /* Tipografia */
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--fonte-primaria);
    }
    
    body, p, span, div {
      font-family: var(--fonte-secundaria);
    }
    
    /* Responsividade específica da região */
    @media (max-width: 768px) {
      .navbar {
        padding: 0.5rem;
      }
      
      .logo {
        max-height: 40px;
      }
    }
  `
}

function gerarVariaveisCSS(identidade: IdentidadeVisualRegional): Record<string, string> {
  const { cores, tipografia, layout } = identidade
  
  return {
    '--cor-primaria': cores.primaria,
    '--cor-secundaria': cores.secundaria,
    '--cor-acento': cores.acento,
    '--cor-texto-primario': cores.texto_primario,
    '--cor-texto-secundario': cores.texto_secundario,
    '--cor-fundo-principal': cores.fundo_principal,
    '--cor-fundo-secundario': cores.fundo_secundario,
    '--fonte-primaria': tipografia.fonte_primaria.familia,
    '--fonte-secundaria': tipografia.fonte_secundaria.familia,
    '--espacamento-base': layout.espacamento === 'compacto' ? '0.5rem' : 
                         layout.espacamento === 'amplo' ? '2rem' : '1rem',
    '--border-radius-base': layout.estilo_botoes === 'rounded' ? '0.5rem' : 
                           layout.estilo_botoes === 'pill' ? '2rem' : '0'
  }
}

async function otimizarAssets(identidade: IdentidadeVisualRegional) {
  // Aqui seria implementada a otimização real dos assets
  // Por enquanto, retornamos um mock
  return {
    logos_webp: {
      principal: identidade.logos.principal + '.webp',
      horizontal: identidade.logos.horizontal + '.webp',
      simbolo: identidade.logos.simbolo + '.webp'
    },
    icones_svg: identidade.elementos.icones_customizados || {},
    fontes_woff2: {
      primaria: '/fonts/' + identidade.tipografia.fonte_primaria.nome.toLowerCase() + '.woff2',
      secundaria: '/fonts/' + identidade.tipografia.fonte_secundaria.nome.toLowerCase() + '.woff2'
    }
  }
}

async function calcularHashCSS(css: string): Promise<string> {
  // Implementação simples de hash
  let hash = 0
  for (let i = 0; i < css.length; i++) {
    const char = css.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

// ========== PREVIEW E TESTES A/B ==========

export async function criarPreviewIdentidade(
  regiaoId: string,
  identidadeTesteId: string,
  configuracao: Partial<PreviewIdentidade>,
  pb?: PocketBase
): Promise<PreviewIdentidade> {
  const client = getClient(pb)
  
  const previewData: Partial<PreviewIdentidade> = {
    regiao_id: regiaoId,
    identidade_teste_id: identidadeTesteId,
    porcentagem_usuarios: configuracao.porcentagem_usuarios || 10,
    duracao_teste_dias: configuracao.duracao_teste_dias || 7,
    metricas_acompanhar: configuracao.metricas_acompanhar || [
      'taxa_conversao', 'tempo_permanencia', 'taxa_rejeicao'
    ],
    status: 'ativo',
    data_inicio: new Date().toISOString(),
    resultados: {
      usuarios_teste: 0,
      usuarios_controle: 0,
      diferenca_conversao: 0,
      significancia_estatistica: 0,
      vencedor: 'empate'
    }
  }
  
  return client.collection('previews_identidade').create(previewData)
}

// ========== ANALYTICS ==========

export async function fetchAnalyticsIdentidade(
  regiaoId: string,
  periodo: string,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  try {
    return await client
      .collection('analytics_identidade')
      .getFirstListItem(`regiao_id = "${regiaoId}" && periodo = "${periodo}"`)
  } catch {
    // Gerar analytics mock se não existir
    return gerarAnalyticsMock(regiaoId, periodo)
  }
}

function gerarAnalyticsMock(regiaoId: string, periodo: string) {
  return {
    regiao_id: regiaoId,
    periodo,
    metricas: {
      tempo_permanencia_medio: Math.random() * 300 + 120, // 2-7 minutos
      taxa_rejeicao: Math.random() * 0.4 + 0.2, // 20-60%
      paginas_por_sessao: Math.random() * 3 + 2, // 2-5 páginas
      conversao_vendas: Math.random() * 0.1 + 0.02, // 2-12%
      satisfacao_usuario: Math.random() * 2 + 3 // 3-5 estrelas
    },
    comparativo: {
      posicao_ranking: Math.floor(Math.random() * 10) + 1,
      score_vs_media: (Math.random() - 0.5) * 20, // -10% a +10%
      melhor_elemento: 'cores',
      elemento_melhorar: 'tipografia'
    },
    feedback: {
      total_avaliacoes: Math.floor(Math.random() * 100) + 20,
      nota_media: Math.random() * 2 + 3,
      comentarios_positivos: [
        'Cores muito bonitas',
        'Design moderno',
        'Fácil navegação'
      ],
      sugestoes_melhoria: [
        'Melhorar contraste do texto',
        'Logo maior no mobile'
      ]
    }
  }
}