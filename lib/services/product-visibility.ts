import type PocketBase from 'pocketbase'
import type { 
  ProdutoVisibilidade,
  SolicitacaoAprovacao,
  NivelVisibilidade,
  StatusAutorizacao,
  DashboardAprovacoes,
  FiltrosProdutoVisibilidade,
  REGRAS_VISIBILIDADE_DEFAULT
} from '../../types/product-visibility'
import type { NivelHierarquia, Usuario } from '../../types/hierarchy'
import createPocketBase from '../pocketbase'

function getClient(pb?: PocketBase): PocketBase {
  return pb ?? createPocketBase()
}

// ========== CONTROLE DE VISIBILIDADE DE PRODUTOS ==========

export async function criarProdutoComVisibilidade(
  produtoId: string,
  criadoPor: string,
  nivelCriador: NivelHierarquia,
  nivelVisibilidadeSolicitado: NivelVisibilidade,
  territorioUsuario: { estado_id: string; regiao_id: string; cidade_id: string },
  pb?: PocketBase
): Promise<ProdutoVisibilidade> {
  const client = getClient(pb)
  
  // Verificar se o usuário pode criar produto com este nível de visibilidade
  const podePublicarDiretamente = verificarVisibilidadeAutomatica(nivelCriador, nivelVisibilidadeSolicitado)
  
  const produtoVisibilidade: Partial<ProdutoVisibilidade> = {
    produto_id: produtoId,
    criado_por: criadoPor,
    nivel_criador: nivelCriador,
    nivel_visibilidade_solicitado: nivelVisibilidadeSolicitado,
    nivel_visibilidade_atual: podePublicarDiretamente ? nivelVisibilidadeSolicitado : 'cidade',
    status_autorizacao: podePublicarDiretamente ? 'automatico' : 'pendente',
    estado_id: territorioUsuario.estado_id,
    regiao_id: territorioUsuario.regiao_id,
    cidade_id: territorioUsuario.cidade_id,
    territorios_visiveis: calcularTerritoriosVisiveis(
      podePublicarDiretamente ? nivelVisibilidadeSolicitado : 'cidade',
      territorioUsuario
    ),
    metricas: {
      visualizacoes_por_territorio: {},
      conversoes_por_territorio: {},
      receita_por_territorio: {}
    },
    historico_aprovacoes: [{
      id: gerarId(),
      tipo: 'criacao',
      nivel_solicitado: nivelVisibilidadeSolicitado,
      solicitante_id: criadoPor,
      data: new Date().toISOString()
    }]
  }
  
  // Configurar aprovações necessárias se não for automática
  if (!podePublicarDiretamente) {
    const aprovacoesNecessarias = determinarAprovacoesNecessarias(
      'cidade', 
      nivelVisibilidadeSolicitado
    )
    
    if (aprovacoesNecessarias.regional) {
      produtoVisibilidade.aprovacao_regional = {
        necessaria: true,
        status: 'pendente'
      }
    }
    
    if (aprovacoesNecessarias.estadual) {
      produtoVisibilidade.aprovacao_estadual = {
        necessaria: true,
        status: 'pendente'
      }
    }
  }
  
  const resultado = await client.collection('produtos_visibilidade').create(produtoVisibilidade)
  
  // Se precisar de aprovação, criar solicitação
  if (!podePublicarDiretamente) {
    await criarSolicitacaoAprovacao(
      produtoId,
      resultado.id,
      criadoPor,
      'cidade',
      nivelVisibilidadeSolicitado,
      'Solicitação de visibilidade para produto',
      pb
    )
  }
  
  return resultado
}

export async function solicitarAlteracaoVisibilidade(
  produtoVisibilidadeId: string,
  novoNivelVisibilidade: NivelVisibilidade,
  solicitanteId: string,
  justificativa: string,
  pb?: PocketBase
): Promise<SolicitacaoAprovacao> {
  const client = getClient(pb)
  
  const produtoVisibilidade = await client
    .collection('produtos_visibilidade')
    .getOne(produtoVisibilidadeId) as ProdutoVisibilidade
  
  // Verificar se o usuário pode fazer esta solicitação
  const usuario = await client.collection('usuarios').getOne(solicitanteId) as Usuario
  
  if (!podeGerenciarProduto(produtoVisibilidade, usuario)) {
    throw new Error('Usuário não tem permissão para alterar este produto')
  }
  
  return criarSolicitacaoAprovacao(
    produtoVisibilidade.produto_id,
    produtoVisibilidadeId,
    solicitanteId,
    produtoVisibilidade.nivel_visibilidade_atual,
    novoNivelVisibilidade,
    justificativa,
    pb
  )
}

async function criarSolicitacaoAprovacao(
  produtoId: string,
  produtoVisibilidadeId: string,
  solicitanteId: string,
  nivelAtual: NivelVisibilidade,
  nivelSolicitado: NivelVisibilidade,
  justificativa: string,
  pb?: PocketBase
): Promise<SolicitacaoAprovacao> {
  const client = getClient(pb)
  
  // Determinar quem precisa aprovar
  const aprovadorNecessario = determinarAprovadorNecessario(nivelSolicitado)
  
  // Buscar informações do produto para a solicitação
  const produto = await client.collection('produtos').getOne(produtoId)
  
  const solicitacao: Partial<SolicitacaoAprovacao> = {
    produto_id: produtoId,
    produto_visibilidade_id: produtoVisibilidadeId,
    solicitante_id: solicitanteId,
    nivel_atual: nivelAtual,
    nivel_solicitado: nivelSolicitado,
    justificativa,
    aprovador_necessario: aprovadorNecessario,
    status: 'pendente',
    produto_info: {
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco,
      vendedor: produto.vendedor_id,
      performance_atual: await buscarPerformanceProduto(produtoId, pb)
    }
  }
  
  const resultado = await client.collection('solicitacoes_aprovacao').create(solicitacao)
  
  // Enviar notificação para o aprovador
  await criarNotificacaoAprovacao(
    aprovadorNecessario,
    'nova_solicitacao',
    produtoId,
    produto.nome,
    resultado.id,
    pb
  )
  
  return resultado
}

export async function processarAprovacao(
  solicitacaoId: string,
  aprovadorId: string,
  acao: 'aprovar' | 'rejeitar',
  comentarios?: string,
  pb?: PocketBase
): Promise<void> {
  const client = getClient(pb)
  
  const solicitacao = await client
    .collection('solicitacoes_aprovacao')
    .getOne(solicitacaoId) as SolicitacaoAprovacao
  
  // Verificar se o usuário pode aprovar
  const aprovador = await client.collection('usuarios').getOne(aprovadorId) as Usuario
  
  if (!podeAprovarSolicitacao(solicitacao, aprovador)) {
    throw new Error('Usuário não tem permissão para aprovar esta solicitação')
  }
  
  const novoStatus: StatusAutorizacao = acao === 'aprovar' ? 'aprovado' : 'rejeitado'
  
  // Atualizar solicitação
  await client.collection('solicitacoes_aprovacao').update(solicitacaoId, {
    status: novoStatus,
    aprovado_por: aprovadorId,
    data_aprovacao: new Date().toISOString(),
    comentarios_aprovador: comentarios
  })
  
  // Se aprovado, atualizar produto visibilidade
  if (acao === 'aprovar') {
    await atualizarVisibilidadeProduto(
      solicitacao.produto_visibilidade_id,
      solicitacao.nivel_solicitado,
      aprovadorId,
      pb
    )
  }
  
  // Enviar notificação para o solicitante
  await criarNotificacaoAprovacao(
    solicitacao.solicitante_id,
    acao === 'aprovar' ? 'produto_aprovado' : 'produto_rejeitado',
    solicitacao.produto_id,
    solicitacao.produto_info.nome,
    undefined,
    pb,
    aprovador.nome,
    comentarios
  )
}

async function atualizarVisibilidadeProduto(
  produtoVisibilidadeId: string,
  novoNivel: NivelVisibilidade,
  aprovadorId: string,
  pb?: PocketBase
): Promise<void> {
  const client = getClient(pb)
  
  const produtoVisibilidade = await client
    .collection('produtos_visibilidade')
    .getOne(produtoVisibilidadeId) as ProdutoVisibilidade
  
  const territoriosVisiveis = calcularTerritoriosVisiveis(novoNivel, {
    estado_id: produtoVisibilidade.estado_id,
    regiao_id: produtoVisibilidade.regiao_id,
    cidade_id: produtoVisibilidade.cidade_id
  })
  
  // Atualizar produto visibilidade
  await client.collection('produtos_visibilidade').update(produtoVisibilidadeId, {
    nivel_visibilidade_atual: novoNivel,
    status_autorizacao: 'aprovado',
    territorios_visiveis: territoriosVisiveis,
    historico_aprovacoes: [
      ...produtoVisibilidade.historico_aprovacoes,
      {
        id: gerarId(),
        tipo: 'aprovacao',
        nivel_anterior: produtoVisibilidade.nivel_visibilidade_atual,
        nivel_solicitado: novoNivel,
        solicitante_id: produtoVisibilidade.criado_por,
        aprovador_id: aprovadorId,
        data: new Date().toISOString()
      }
    ]
  })
}

// ========== CONSULTAS DE PRODUTOS ==========

export async function buscarProdutosVisiveis(
  usuarioId: string,
  territorioUsuario: { estado_id: string; regiao_id: string; cidade_id: string },
  filtros?: Partial<FiltrosProdutoVisibilidade>,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  // Construir filtro de visibilidade baseado no território do usuário
  const filtroVisibilidade = construirFiltroVisibilidade(territorioUsuario)
  
  // Combinar com filtros adicionais
  let filtroCompleto = filtroVisibilidade
  if (filtros) {
    const filtrosAdicionais = construirFiltrosAdicionais(filtros)
    filtroCompleto = `(${filtroVisibilidade}) && (${filtrosAdicionais})`
  }
  
  return client.collection('produtos_visibilidade').getFullList({
    filter: filtroCompleto,
    expand: 'produto_id',
    sort: '-created'
  })
}

export async function buscarProdutosPendentesAprovacao(
  aprovadorId: string,
  nivelAprovador: NivelHierarquia,
  pb?: PocketBase
): Promise<SolicitacaoAprovacao[]> {
  const client = getClient(pb)
  
  return client.collection('solicitacoes_aprovacao').getFullList({
    filter: `aprovador_necessario = "${nivelAprovador}" && status = "pendente"`,
    expand: 'produto_id,solicitante_id',
    sort: 'created'
  })
}

export async function gerarDashboardAprovacoes(
  usuarioId: string,
  nivelHierarquia: NivelHierarquia,
  pb?: PocketBase
): Promise<DashboardAprovacoes> {
  const client = getClient(pb)
  
  // Buscar dados para o dashboard
  const [
    solicitacoesPendentes,
    aprovacoesHoje,
    rejeicoesHoje,
    produtosPorStatus
  ] = await Promise.all([
    buscarProdutosPendentesAprovacao(usuarioId, nivelHierarquia, pb),
    buscarAprovacoesHoje(usuarioId, pb),
    buscarRejeicoesHoje(usuarioId, pb),
    buscarProdutosPorStatus(nivelHierarquia, pb)
  ])
  
  return {
    usuario_id: usuarioId,
    nivel_hierarquia: nivelHierarquia,
    pendentes_aprovacao: solicitacoesPendentes.length,
    aprovadas_hoje: aprovacoesHoje.length,
    rejeitadas_hoje: rejeicoesHoje.length,
    aguardando_resposta: solicitacoesPendentes.filter(s => 
      isDateOlderThan(s.created, 24)
    ).length,
    produtos_por_status: produtosPorStatus,
    tempo_medio_aprovacao: calcularTempoMedioAprovacao(aprovacoesHoje),
    taxa_aprovacao: calcularTaxaAprovacao(aprovacoesHoje, rejeicoesHoje),
    produtos_mais_solicitados: await buscarProdutosMaisSolicitados(pb),
    vendedores_mais_ativos: await buscarVendedoresMaisAtivos(pb),
    data_atualizacao: new Date().toISOString()
  }
}

// ========== FUNÇÕES AUXILIARES ==========

function verificarVisibilidadeAutomatica(
  nivelCriador: NivelHierarquia,
  nivelSolicitado: NivelVisibilidade
): boolean {
  const niveisAutomaticos = REGRAS_VISIBILIDADE_DEFAULT.visibilidade_automatica[nivelCriador]
  return niveisAutomaticos.includes(nivelSolicitado)
}

function determinarAprovadorNecessario(nivelVisibilidade: NivelVisibilidade): NivelHierarquia {
  const aprovadores = REGRAS_VISIBILIDADE_DEFAULT.aprovadores[nivelVisibilidade]
  return aprovadores[0] // Retorna o primeiro aprovador necessário
}

function determinarAprovacoesNecessarias(
  nivelAtual: NivelVisibilidade,
  nivelSolicitado: NivelVisibilidade
): { regional: boolean; estadual: boolean } {
  const necessarias = { regional: false, estadual: false }
  
  // Se solicita nível regional ou superior, precisa aprovação regional
  if (['regiao', 'estado', 'nacional'].includes(nivelSolicitado) && 
      nivelAtual === 'cidade') {
    necessarias.regional = true
  }
  
  // Se solicita nível estadual ou nacional, precisa aprovação estadual
  if (['estado', 'nacional'].includes(nivelSolicitado)) {
    necessarias.estadual = true
  }
  
  return necessarias
}

function calcularTerritoriosVisiveis(
  nivel: NivelVisibilidade,
  territorio: { estado_id: string; regiao_id: string; cidade_id: string }
) {
  switch (nivel) {
    case 'cidade':
      return {
        estados: [],
        regioes: [],
        cidades: [territorio.cidade_id]
      }
    case 'regiao':
      return {
        estados: [],
        regioes: [territorio.regiao_id],
        cidades: []
      }
    case 'estado':
      return {
        estados: [territorio.estado_id],
        regioes: [],
        cidades: []
      }
    case 'nacional':
      return {
        estados: ['*'], // Todos os estados
        regioes: [],
        cidades: []
      }
    default:
      return { estados: [], regioes: [], cidades: [] }
  }
}

function construirFiltroVisibilidade(
  territorio: { estado_id: string; regiao_id: string; cidade_id: string }
): string {
  return `
    (territorios_visiveis.cidades ~ "${territorio.cidade_id}") ||
    (territorios_visiveis.regioes ~ "${territorio.regiao_id}") ||
    (territorios_visiveis.estados ~ "${territorio.estado_id}") ||
    (territorios_visiveis.estados ~ "*")
  `.replace(/\s+/g, ' ').trim()
}

function construirFiltrosAdicionais(filtros: Partial<FiltrosProdutoVisibilidade>): string {
  const condicoes: string[] = []
  
  if (filtros.nivel_visibilidade) {
    const niveis = filtros.nivel_visibilidade.map(n => `"${n}"`).join(',')
    condicoes.push(`nivel_visibilidade_atual IN (${niveis})`)
  }
  
  if (filtros.status_autorizacao) {
    const status = filtros.status_autorizacao.map(s => `"${s}"`).join(',')
    condicoes.push(`status_autorizacao IN (${status})`)
  }
  
  if (filtros.criado_por) {
    condicoes.push(`criado_por = "${filtros.criado_por}"`)
  }
  
  if (filtros.data_inicio) {
    condicoes.push(`created >= "${filtros.data_inicio}"`)
  }
  
  if (filtros.data_fim) {
    condicoes.push(`created <= "${filtros.data_fim}"`)
  }
  
  return condicoes.length > 0 ? condicoes.join(' && ') : 'id != ""'
}

function podeGerenciarProduto(produto: ProdutoVisibilidade, usuario: Usuario): boolean {
  // O criador sempre pode gerenciar
  if (produto.criado_por === usuario.id) return true
  
  // Coordenadores podem gerenciar produtos em seu território
  if (usuario.nivel_hierarquia === 'coordenador_regional' && 
      produto.regiao_id === usuario.regiao_id) {
    return true
  }
  
  if (usuario.nivel_hierarquia === 'coordenador_geral' && 
      produto.estado_id === usuario.estado_id) {
    return true
  }
  
  return false
}

function podeAprovarSolicitacao(solicitacao: SolicitacaoAprovacao, aprovador: Usuario): boolean {
  return aprovador.nivel_hierarquia === solicitacao.aprovador_necessario
}

async function criarNotificacaoAprovacao(
  usuarioId: string,
  tipo: 'nova_solicitacao' | 'produto_aprovado' | 'produto_rejeitado',
  produtoId: string,
  produtoNome: string,
  solicitacaoId?: string,
  pb?: PocketBase,
  aprovadorNome?: string,
  comentarios?: string
): Promise<void> {
  const client = getClient(pb)
  
  await client.collection('notificacoes_aprovacao').create({
    usuario_id: usuarioId,
    tipo,
    produto_id: produtoId,
    produto_nome: produtoNome,
    solicitacao_id: solicitacaoId,
    aprovador_nome: aprovadorNome,
    comentarios,
    lida: false
  })
}

// Mock functions para buscar dados
async function buscarPerformanceProduto(produtoId: string, pb?: PocketBase) {
  return {
    vendas_ultimo_mes: Math.floor(Math.random() * 100),
    avaliacao_media: Math.random() * 2 + 3,
    total_avaliacoes: Math.floor(Math.random() * 50)
  }
}

async function buscarAprovacoesHoje(aprovadorId: string, pb?: PocketBase) {
  const hoje = new Date().toISOString().split('T')[0]
  return [] // Mock
}

async function buscarRejeicoesHoje(aprovadorId: string, pb?: PocketBase) {
  return [] // Mock
}

async function buscarProdutosPorStatus(nivel: NivelHierarquia, pb?: PocketBase) {
  return {
    pendente: Math.floor(Math.random() * 20),
    aprovado: Math.floor(Math.random() * 100),
    rejeitado: Math.floor(Math.random() * 10),
    automatico: Math.floor(Math.random() * 50)
  }
}

async function buscarProdutosMaisSolicitados(pb?: PocketBase) {
  return [] // Mock
}

async function buscarVendedoresMaisAtivos(pb?: PocketBase) {
  return [] // Mock
}

function calcularTempoMedioAprovacao(aprovacoes: any[]): number {
  return Math.random() * 24 // Mock - retorna horas
}

function calcularTaxaAprovacao(aprovacoes: any[], rejeicoes: any[]): number {
  const total = aprovacoes.length + rejeicoes.length
  return total > 0 ? (aprovacoes.length / total) * 100 : 0
}

function isDateOlderThan(dateString: string, hours: number): boolean {
  const date = new Date(dateString)
  const now = new Date()
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  return diffHours > hours
}

function gerarId(): string {
  return Math.random().toString(36).substr(2, 9)
}