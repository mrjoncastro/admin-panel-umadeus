import type PocketBase from 'pocketbase'
import type { 
  Estado, 
  Regiao, 
  Cidade, 
  Usuario, 
  NivelHierarquia,
  ComissaoHierarquica,
  VendorHierarquico,
  ProdutoHierarquico,
  DashboardData,
  ControleAcesso
} from '../../types/hierarchy'
import createPocketBase from '../pocketbase'

function getClient(pb?: PocketBase): PocketBase {
  return pb ?? createPocketBase()
}

// ========== ESTADOS ==========

export async function fetchEstados(pb?: PocketBase): Promise<Estado[]> {
  const client = getClient(pb)
  return client.collection('estados').getFullList({
    expand: 'coordenador_geral',
    sort: 'nome'
  })
}

export async function fetchEstado(estadoId: string, pb?: PocketBase): Promise<Estado> {
  const client = getClient(pb)
  return client.collection('estados').getOne(estadoId, {
    expand: 'coordenador_geral,regioes,cidades'
  })
}

export async function createEstado(estadoData: Partial<Estado>, pb?: PocketBase): Promise<Estado> {
  const client = getClient(pb)
  return client.collection('estados').create(estadoData)
}

// ========== REGIÕES ==========

export async function fetchRegioesByEstado(estadoId: string, pb?: PocketBase): Promise<Regiao[]> {
  const client = getClient(pb)
  return client.collection('regioes').getFullList({
    filter: `estado_id = "${estadoId}"`,
    expand: 'coordenador_regional,cidades',
    sort: 'nome'
  })
}

export async function fetchRegiao(regiaoId: string, pb?: PocketBase): Promise<Regiao> {
  const client = getClient(pb)
  return client.collection('regioes').getOne(regiaoId, {
    expand: 'estado,coordenador_regional,cidades'
  })
}

export async function createRegiao(regiaoData: Partial<Regiao>, pb?: PocketBase): Promise<Regiao> {
  const client = getClient(pb)
  return client.collection('regioes').create(regiaoData)
}

// ========== CIDADES ==========

export async function fetchCidadesByRegiao(regiaoId: string, pb?: PocketBase): Promise<Cidade[]> {
  const client = getClient(pb)
  return client.collection('cidades').getFullList({
    filter: `regiao_id = "${regiaoId}"`,
    expand: 'lider_local',
    sort: 'nome'
  })
}

export async function fetchCidadesByEstado(estadoId: string, pb?: PocketBase): Promise<Cidade[]> {
  const client = getClient(pb)
  return client.collection('cidades').getFullList({
    filter: `estado_id = "${estadoId}"`,
    expand: 'lider_local,regiao',
    sort: 'nome'
  })
}

export async function fetchCidade(cidadeId: string, pb?: PocketBase): Promise<Cidade> {
  const client = getClient(pb)
  return client.collection('cidades').getOne(cidadeId, {
    expand: 'estado,regiao,lider_local'
  })
}

export async function createCidade(cidadeData: Partial<Cidade>, pb?: PocketBase): Promise<Cidade> {
  const client = getClient(pb)
  return client.collection('cidades').create(cidadeData)
}

// ========== USUÁRIOS HIERÁRQUICOS ==========

export async function fetchUsuariosByNivel(
  nivel: NivelHierarquia,
  filtros?: {
    estadoId?: string
    regiaoId?: string
    cidadeId?: string
  },
  pb?: PocketBase
): Promise<Usuario[]> {
  const client = getClient(pb)
  
  let filter = `nivel_hierarquia = "${nivel}"`
  
  if (filtros?.estadoId) {
    filter += ` && estado_id = "${filtros.estadoId}"`
  }
  
  if (filtros?.regiaoId) {
    filter += ` && regiao_id = "${filtros.regiaoId}"`
  }
  
  if (filtros?.cidadeId) {
    filter += ` && cidade_id = "${filtros.cidadeId}"`
  }
  
  return client.collection('usuarios').getFullList({
    filter,
    expand: 'estado,regiao,cidade',
    sort: 'nome'
  })
}

export async function fetchUsuario(usuarioId: string, pb?: PocketBase): Promise<Usuario> {
  const client = getClient(pb)
  return client.collection('usuarios').getOne(usuarioId, {
    expand: 'estado,regiao,cidade'
  })
}

export async function createUsuario(usuarioData: Partial<Usuario>, pb?: PocketBase): Promise<Usuario> {
  const client = getClient(pb)
  
  // Definir permissões baseadas no nível hierárquico
  const permissoesDefault = getPermissoesPorNivel(usuarioData.nivel_hierarquia!)
  
  const dadosCompletos = {
    ...usuarioData,
    permissoes: { ...permissoesDefault, ...usuarioData.permissoes }
  }
  
  return client.collection('usuarios').create(dadosCompletos)
}

function getPermissoesPorNivel(nivel: NivelHierarquia) {
  switch (nivel) {
    case 'coordenador_geral':
      return {
        ver_todos_estados: true,
        gerenciar_coordenadores_regionais: true,
        gerenciar_lideres_locais: true,
        aprovar_produtos: true,
        gerenciar_comissoes: true,
        ver_financeiro_completo: true,
        processar_saques: true,
        liberar_comissoes: true,
        criar_produtos: true,
        vender_produtos: true,
        gerenciar_inscricoes: true
      }
    
    case 'coordenador_regional':
      return {
        ver_estado: true,
        ver_regiao: true,
        gerenciar_lideres_locais: true,
        aprovar_produtos: true,
        ver_financeiro_estado: true,
        ver_financeiro_regiao: true,
        criar_produtos: true,
        vender_produtos: true,
        gerenciar_inscricoes: true
      }
    
    case 'lider_local':
      return {
        ver_regiao: true,
        ver_cidade: true,
        ver_financeiro_regiao: true,
        ver_financeiro_cidade: true,
        criar_produtos: true,
        vender_produtos: true,
        gerenciar_inscricoes: true
      }
    
    default:
      return {}
  }
}

// ========== SISTEMA DE COMISSÕES HIERÁRQUICO ==========

export async function calcularComissaoHierarquica(
  vendorId: string,
  pedidoId: string,
  produtoId: string,
  valorVenda: number,
  pb?: PocketBase
): Promise<ComissaoHierarquica> {
  const client = getClient(pb)
  
  // Buscar o vendor e sua hierarquia
  const vendor = await client.collection('vendors').getOne(vendorId, {
    expand: 'estado,regiao,cidade'
  }) as VendorHierarquico
  
  // Buscar configurações de comissão
  const estado = vendor.expand?.estado
  const regiao = vendor.expand?.regiao
  const cidade = vendor.expand?.cidade
  
  // Calcular comissões baseadas na hierarquia
  const comissoes = calcularComissoesPorNivel(
    valorVenda,
    estado?.configuracoes || {},
    regiao?.configuracoes || {},
    cidade?.configuracoes || {}
  )
  
  // Buscar os IDs dos beneficiários
  const liderLocal = cidade?.lider_local
  const coordenadorRegional = regiao?.coordenador_regional
  const coordenadorGeral = estado?.coordenador_geral
  
  const comissaoData: Partial<ComissaoHierarquica> = {
    pedido_id: pedidoId,
    produto_id: produtoId,
    vendor_id: vendorId,
    valor_venda: valorVenda,
    valor_produto: valorVenda, // Assumindo que o valor da venda é o valor base
    
    // Valores das comissões
    comissao_vendor: comissoes.vendor,
    comissao_lider_local: comissoes.lider,
    comissao_coordenador_regional: comissoes.coordenadorRegional,
    comissao_coordenador_geral: comissoes.coordenadorGeral,
    
    // Percentuais
    percentual_vendor: comissoes.percentualVendor,
    percentual_lider: comissoes.percentualLider,
    percentual_coordenador_regional: comissoes.percentualCoordenadorRegional,
    percentual_coordenador_geral: comissoes.percentualCoordenadorGeral,
    
    // Beneficiários
    vendor_id_beneficiario: vendorId,
    lider_id_beneficiario: liderLocal,
    coordenador_regional_id_beneficiario: coordenadorRegional,
    coordenador_geral_id_beneficiario: coordenadorGeral,
    
    // Hierarquia
    estado_id: vendor.estado_id,
    regiao_id: vendor.regiao_id,
    cidade_id: vendor.cidade_id,
    
    status: 'pendente'
  }
  
  return client.collection('comissoes_hierarquicas').create(comissaoData)
}

function calcularComissoesPorNivel(
  valorVenda: number,
  configEstado: any,
  configRegiao: any,
  configCidade: any
) {
  // Usar configurações específicas ou padrões
  const percentualVendor = 40 // 40% para o vendor
  const percentualLider = configCidade?.comissao_lider_local || 
                         configRegiao?.comissao_lider_local || 
                         configEstado?.comissao_lider_local || 15 // 15% padrão
  
  const percentualCoordenadorRegional = configRegiao?.comissao_coordenador_regional || 
                                       configEstado?.comissao_coordenador_regional || 10 // 10% padrão
  
  const percentualCoordenadorGeral = configEstado?.comissao_coordenador_geral || 5 // 5% padrão
  
  return {
    vendor: (valorVenda * percentualVendor) / 100,
    lider: (valorVenda * percentualLider) / 100,
    coordenadorRegional: (valorVenda * percentualCoordenadorRegional) / 100,
    coordenadorGeral: (valorVenda * percentualCoordenadorGeral) / 100,
    percentualVendor,
    percentualLider,
    percentualCoordenadorRegional,
    percentualCoordenadorGeral
  }
}

// ========== CONTROLE DE ACESSO ==========

export function criarControleAcesso(usuario: Usuario): ControleAcesso {
  return {
    usuario_id: usuario.id,
    nivel: usuario.nivel_hierarquia,
    estado_id: usuario.estado_id,
    regiao_id: usuario.regiao_id,
    cidade_id: usuario.cidade_id,
    
    pode_acessar: (recurso: string, acao: string, contexto?: any) => {
      return verificarPermissao(usuario, recurso, acao, contexto)
    }
  }
}

function verificarPermissao(
  usuario: Usuario,
  recurso: string,
  acao: string,
  contexto?: any
): boolean {
  const { nivel_hierarquia, permissoes, estado_id, regiao_id, cidade_id } = usuario
  
  // Coordenador geral tem acesso total
  if (nivel_hierarquia === 'coordenador_geral') {
    return true
  }
  
  // Verificar permissões específicas
  switch (recurso) {
    case 'vendedores':
      if (acao === 'visualizar') {
        return nivel_hierarquia === 'coordenador_regional' 
          ? contexto?.estado_id === estado_id
          : contexto?.cidade_id === cidade_id
      }
      break
      
    case 'produtos':
      if (acao === 'criar') {
        return permissoes.criar_produtos || false
      }
      if (acao === 'aprovar') {
        return permissoes.aprovar_produtos || false
      }
      break
      
    case 'financeiro':
      if (acao === 'visualizar') {
        if (nivel_hierarquia === 'coordenador_regional') {
          return contexto?.estado_id === estado_id || contexto?.regiao_id === regiao_id
        }
        if (nivel_hierarquia === 'lider_local') {
          return contexto?.cidade_id === cidade_id
        }
      }
      break
      
    case 'comissoes':
      if (acao === 'liberar') {
        return permissoes.liberar_comissoes || false
      }
      break
  }
  
  return false
}

// ========== DASHBOARD HIERÁRQUICO ==========

export async function gerarDashboardHierarquico(
  usuario: Usuario,
  periodo: string,
  pb?: PocketBase
): Promise<DashboardData> {
  const client = getClient(pb)
  
  const dashboardData: DashboardData = {
    nivel_usuario: usuario.nivel_hierarquia,
    periodo,
    metricas_nivel: {
      vendas_quantidade: 0,
      vendas_valor: 0,
      comissoes_recebidas: 0,
      produtos_ativos: 0
    }
  }
  
  // Buscar dados baseados no nível hierárquico
  switch (usuario.nivel_hierarquia) {
    case 'coordenador_geral':
      await preencherDashboardCoordenadorGeral(dashboardData, usuario, periodo, client)
      break
      
    case 'coordenador_regional':
      await preencherDashboardCoordenadorRegional(dashboardData, usuario, periodo, client)
      break
      
    case 'lider_local':
      await preencherDashboardLiderLocal(dashboardData, usuario, periodo, client)
      break
  }
  
  return dashboardData
}

async function preencherDashboardCoordenadorGeral(
  dashboard: DashboardData,
  usuario: Usuario,
  periodo: string,
  pb: PocketBase
) {
  // Buscar métricas de todos os estados
  const estados = await pb.collection('estados').getFullList()
  
  dashboard.metricas_subordinados = {
    total_regioes: 0,
    total_cidades: 0,
    total_lideres: 0,
    performance_por_regiao: []
  }
  
  // Implementar lógica específica para coordenador geral
  // Calcular vendas totais, comissões, etc.
}

async function preencherDashboardCoordenadorRegional(
  dashboard: DashboardData,
  usuario: Usuario,
  periodo: string,
  pb: PocketBase
) {
  // Buscar métricas da região específica
  if (!usuario.regiao_id) return
  
  const regiao = await pb.collection('regioes').getOne(usuario.regiao_id, {
    expand: 'cidades'
  })
  
  dashboard.metricas_subordinados = {
    total_cidades: regiao.expand?.cidades?.length || 0,
    total_lideres: 0,
    performance_por_cidade: []
  }
  
  // Implementar lógica específica para coordenador regional
}

async function preencherDashboardLiderLocal(
  dashboard: DashboardData,
  usuario: Usuario,
  periodo: string,
  pb: PocketBase
) {
  // Buscar métricas da cidade específica
  if (!usuario.cidade_id) return
  
  // Implementar lógica específica para líder local
  // Buscar vendas da cidade, comissões recebidas, etc.
}

// ========== PRODUTOS HIERÁRQUICOS ==========

export async function fetchProdutosDisponiveis(
  usuario: Usuario,
  pb?: PocketBase
): Promise<ProdutoHierarquico[]> {
  const client = getClient(pb)
  
  let filter = 'aprovado = true && ativo = true'
  
  // Filtrar produtos baseado na hierarquia do usuário
  switch (usuario.nivel_hierarquia) {
    case 'coordenador_geral':
      // Pode ver todos os produtos
      break
      
    case 'coordenador_regional':
      filter += ` && (disponivel_estado_inteiro = true || estado_id = "${usuario.estado_id}")`
      if (usuario.regiao_id) {
        filter += ` || disponivel_regioes ~ "${usuario.regiao_id}"`
      }
      break
      
    case 'lider_local':
      filter += ` && (disponivel_estado_inteiro = true || estado_id = "${usuario.estado_id}"`
      if (usuario.regiao_id) {
        filter += ` || disponivel_regioes ~ "${usuario.regiao_id}"`
      }
      if (usuario.cidade_id) {
        filter += ` || disponivel_cidades ~ "${usuario.cidade_id}"`
      }
      filter += ')'
      break
  }
  
  return client.collection('produtos').getFullList({
    filter,
    expand: 'criador,estado,regiao,cidade',
    sort: '-created'
  })
}

// ========== RELATÓRIOS HIERÁRQUICOS ==========

export async function gerarRelatorioHierarquico(
  tipo: string,
  filtros: {
    estadoId?: string
    regiaoId?: string
    cidadeId?: string
    periodoInicio: string
    periodoFim: string
  },
  solicitadoPor: string,
  nivelSolicitante: NivelHierarquia,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  const relatorioData = {
    tipo,
    estado_id: filtros.estadoId,
    regiao_id: filtros.regiaoId,
    cidade_id: filtros.cidadeId,
    periodo_inicio: filtros.periodoInicio,
    periodo_fim: filtros.periodoFim,
    solicitado_por: solicitadoPor,
    nivel_solicitante: nivelSolicitante,
    status: 'processando',
    dados: {
      resumo_geral: {},
      detalhamento_por_nivel: {}
    }
  }
  
  return client.collection('relatorios_hierarquicos').create(relatorioData)
}