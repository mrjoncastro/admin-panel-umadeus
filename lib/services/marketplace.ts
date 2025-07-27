import type PocketBase from 'pocketbase'
import type { 
  Vendor, 
  ProdutoMarketplace, 
  Comissao, 
  SaqueComissao,
  VendorAnalytics,
  MarketplaceConfig,
  ProdutoAvaliacao,
  VendorNotificacao 
} from '../../types/marketplace'
import { createTenantPocketBase } from '../pocketbase'

function getClient(pb?: PocketBase): PocketBase {
  return pb ?? createTenantPocketBase()
}

// ========== VENDORS ==========

export async function fetchVendors(tenantId: string, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('vendors').getFullList({
    filter: `cliente = "${tenantId}"`,
    expand: 'cliente,created_by,aprovado_por',
    sort: '-created',
  }) as Promise<Vendor[]>
}

export async function fetchVendor(vendorId: string, tenantId: string, pb?: PocketBase) {
  const client = getClient(pb)
  const vendor = await client.collection('vendors').getOne(vendorId, {
    expand: 'cliente,created_by,aprovado_por'
  })
  
  if (vendor.cliente !== tenantId) {
    throw new Error('TENANT_MISMATCH')
  }
  
  return vendor as Vendor
}

export async function createVendor(vendorData: Partial<Vendor>, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('vendors').create(vendorData) as Promise<Vendor>
}

export async function updateVendor(vendorId: string, vendorData: Partial<Vendor>, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('vendors').update(vendorId, vendorData) as Promise<Vendor>
}

export async function aprovarVendor(vendorId: string, aprovadoPor: string, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('vendors').update(vendorId, {
    status: 'ativo',
    data_aprovacao: new Date().toISOString(),
    aprovado_por: aprovadoPor
  }) as Promise<Vendor>
}

export async function rejeitarVendor(vendorId: string, motivo: string, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('vendors').update(vendorId, {
    status: 'rejeitado',
    motivo_rejeicao: motivo
  }) as Promise<Vendor>
}

// ========== PRODUTOS MARKETPLACE ==========

export async function fetchProdutosMarketplace(
  tenantId: string, 
  filtros?: {
    vendorId?: string
    status?: string
    categoria?: string
    moderacaoStatus?: string
  },
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  let filter = `cliente = "${tenantId}"`
  
  if (filtros?.vendorId) {
    filter += ` && vendor_id = "${filtros.vendorId}"`
  }
  
  if (filtros?.moderacaoStatus) {
    filter += ` && moderacao_status = "${filtros.moderacaoStatus}"`
  }
  
  if (filtros?.categoria) {
    filter += ` && categoria ~ "${filtros.categoria}"`
  }
  
  return client.collection('produtos').getFullList({
    filter,
    expand: 'vendor_id,categoria,user_org,created_by,aprovado_por',
    sort: '-created',
  }) as Promise<ProdutoMarketplace[]>
}

export async function fetchProdutoMarketplace(produtoId: string, tenantId: string, pb?: PocketBase) {
  const client = getClient(pb)
  const produto = await client.collection('produtos').getOne(produtoId, {
    expand: 'vendor_id,categoria,user_org,created_by,aprovado_por'
  })
  
  if (produto.cliente !== tenantId) {
    throw new Error('TENANT_MISMATCH')
  }
  
  return produto as ProdutoMarketplace
}

export async function aprovarProduto(produtoId: string, aprovadoPor: string, aprovadoPorRole: string, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('produtos').update(produtoId, {
    moderacao_status: 'aprovado',
    data_aprovacao: new Date().toISOString(),
    aprovado_por: aprovadoPor,
    aprovado_por_role: aprovadoPorRole
  }) as Promise<ProdutoMarketplace>
}

export async function rejeitarProduto(produtoId: string, motivo: string, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('produtos').update(produtoId, {
    moderacao_status: 'rejeitado',
    motivo_rejeicao: motivo
  }) as Promise<ProdutoMarketplace>
}

// ========== COMISSÕES ==========

export async function fetchComissoes(
  tenantId: string,
  filtros?: {
    vendorId?: string
    status?: string
    periodo?: { inicio: string; fim: string }
  },
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  let filter = `cliente = "${tenantId}"`
  
  if (filtros?.vendorId) {
    filter += ` && vendor_id = "${filtros.vendorId}"`
  }
  
  if (filtros?.status) {
    filter += ` && status = "${filtros.status}"`
  }
  
  if (filtros?.periodo) {
    filter += ` && data_venda >= "${filtros.periodo.inicio}" && data_venda <= "${filtros.periodo.fim}"`
  }
  
  return client.collection('comissoes').getFullList({
    filter,
    expand: 'vendor_id,pedido_id,produto_id,cliente',
    sort: '-created',
  }) as Promise<Comissao[]>
}

export async function calcularComissao(
  vendorId: string,
  pedidoId: string,
  produtoId: string,
  produtoNome: string,
  clienteNome: string,
  valorVenda: number,
  percentualComissao: number,
  tenantId: string,
  pb?: PocketBase
): Promise<Comissao> {
  const client = getClient(pb)
  
  const valorComissao = (valorVenda * percentualComissao) / 100
  
  const comissaoData: Partial<Comissao> = {
    vendor_id: vendorId,
    pedido_id: pedidoId,
    produto_id: produtoId,
    produto_nome: produtoNome,
    cliente_nome: clienteNome,
    valor_venda: valorVenda,
    percentual_comissao: percentualComissao,
    valor_comissao: valorComissao,
    status: 'pendente',
    data_venda: new Date().toISOString(),
    cliente: tenantId,
  }
  
  return client.collection('comissoes').create(comissaoData) as Promise<Comissao>
}

export async function liberarComissoes(comissoesIds: string[], pb?: PocketBase) {
  const client = getClient(pb)
  const dataLiberacao = new Date().toISOString()
  
  const promessas = comissoesIds.map(id =>
    client.collection('comissoes').update(id, {
      status: 'liberada',
      data_liberacao: dataLiberacao
    })
  )
  
  return Promise.all(promessas)
}

// ========== SAQUES ==========

export async function fetchSaquesComissao(
  tenantId: string,
  filtros?: {
    vendorId?: string
    status?: string
    periodo?: { inicio: string; fim: string }
  },
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  let filter = `cliente = "${tenantId}"`
  
  if (filtros?.vendorId) {
    filter += ` && vendor_id = "${filtros.vendorId}"`
  }
  
  if (filtros?.status) {
    filter += ` && status = "${filtros.status}"`
  }
  
  if (filtros?.periodo) {
    filter += ` && data_solicitacao >= "${filtros.periodo.inicio}" && data_solicitacao <= "${filtros.periodo.fim}"`
  }
  
  return client.collection('saques_comissao').getFullList({
    filter,
    expand: 'vendor_id,processado_por,cliente',
    sort: '-created',
  }) as Promise<SaqueComissao[]>
}

export async function solicitarSaque(
  vendorId: string,
  valorSolicitado: number,
  comissoesIds: string[],
  tenantId: string,
  pb?: PocketBase
): Promise<SaqueComissao> {
  const client = getClient(pb)
  
  // Calcular taxa de saque (buscar da configuração do marketplace)
  const config = await fetchMarketplaceConfig(tenantId, pb)
  const taxaSaque = config?.taxa_saque || 0
  const valorLiquido = valorSolicitado - (valorSolicitado * taxaSaque / 100)
  
  const saqueData: Partial<SaqueComissao> = {
    vendor_id: vendorId,
    valor_solicitado: valorSolicitado,
    comissoes_ids: comissoesIds,
    taxa_saque: taxaSaque,
    valor_liquido: valorLiquido,
    status: 'solicitado',
    data_solicitacao: new Date().toISOString(),
    cliente: tenantId,
  }
  
  return client.collection('saques_comissao').create(saqueData) as Promise<SaqueComissao>
}

export async function processarSaque(
  saqueId: string,
  processadoPor: string,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  return client.collection('saques_comissao').update(saqueId, {
    status: 'processando',
    data_processamento: new Date().toISOString(),
    processado_por: processadoPor
  }) as Promise<SaqueComissao>
}

export async function confirmarPagamentoSaque(
  saqueId: string,
  comprovante: string,
  formaPagamento: 'pix' | 'ted' | 'doc',
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  return client.collection('saques_comissao').update(saqueId, {
    status: 'pago',
    data_pagamento: new Date().toISOString(),
    comprovante: comprovante,
    forma_pagamento: formaPagamento
  }) as Promise<SaqueComissao>
}

// ========== ANALYTICS ==========

export async function fetchVendorAnalytics(
  vendorId: string,
  tenantId: string,
  periodo?: string,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  let filter = `vendor_id = "${vendorId}" && cliente = "${tenantId}"`
  
  if (periodo) {
    filter += ` && periodo = "${periodo}"`
  }
  
  return client.collection('vendor_analytics').getFullList({
    filter,
    expand: 'vendor_id,cliente',
    sort: '-periodo',
  }) as Promise<VendorAnalytics[]>
}

export async function gerarAnalyticsVendor(
  vendorId: string,
  periodo: string,
  tenantId: string,
  pb?: PocketBase
): Promise<VendorAnalytics> {
  const client = getClient(pb)
  
  // Buscar dados do período
  const inicioPeriodo = `${periodo}-01`
  const [ano, mes] = periodo.split('-')
  const proximoMes = parseInt(mes) === 12 ? `${parseInt(ano) + 1}-01` : `${ano}-${(parseInt(mes) + 1).toString().padStart(2, '0')}`
  const fimPeriodo = `${proximoMes}-01`
  
  // Buscar comissões do período
  const comissoes = await client.collection('comissoes').getFullList({
    filter: `vendor_id = "${vendorId}" && data_venda >= "${inicioPeriodo}" && data_venda < "${fimPeriodo}"`
  })
  
  // Buscar produtos cadastrados no período
  const produtos = await client.collection('produtos').getFullList({
    filter: `vendor_id = "${vendorId}" && created >= "${inicioPeriodo}" && created < "${fimPeriodo}"`
  })
  
  // Calcular métricas
  const comissoesVendidas = comissoes.filter(c => c.status === 'paga' || c.status === 'liberada')
  const vendasQuantidade = comissoesVendidas.length
  const vendasValor = comissoesVendidas.reduce((sum, c) => sum + parseFloat(c.valor_venda), 0)
  const comissaoValor = comissoesVendidas.reduce((sum, c) => sum + parseFloat(c.valor_comissao), 0)
  const ticketMedio = vendasQuantidade > 0 ? vendasValor / vendasQuantidade : 0
  
  const analyticsData: Partial<VendorAnalytics> = {
    vendor_id: vendorId,
    periodo,
    vendas_quantidade: vendasQuantidade,
    vendas_valor: vendasValor,
    comissao_valor: comissaoValor,
    ticket_medio: ticketMedio,
    produtos_cadastrados: produtos.length,
    produtos_aprovados: produtos.filter(p => p.moderacao_status === 'aprovado').length,
    produtos_rejeitados: produtos.filter(p => p.moderacao_status === 'rejeitado').length,
    cliente: tenantId,
  }
  
  // Verificar se já existe analytics para este período
  try {
    const existingAnalytics = await client.collection('vendor_analytics').getFirstListItem(
      `vendor_id = "${vendorId}" && periodo = "${periodo}"`
    )
    return client.collection('vendor_analytics').update(existingAnalytics.id, analyticsData) as Promise<VendorAnalytics>
  } catch {
    return client.collection('vendor_analytics').create(analyticsData) as Promise<VendorAnalytics>
  }
}

// ========== AVALIAÇÕES ==========

export async function fetchAvaliacoesProduto(
  produtoId: string,
  tenantId: string,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  return client.collection('produto_avaliacoes').getFullList({
    filter: `produto_id = "${produtoId}" && cliente = "${tenantId}" && status = "ativa"`,
    expand: 'produto_id,cliente_id,pedido_id',
    sort: '-created',
  }) as Promise<ProdutoAvaliacao[]>
}

export async function criarAvaliacao(
  produtoId: string,
  clienteId: string,
  pedidoId: string,
  nota: number,
  comentario: string,
  tenantId: string,
  pb?: PocketBase
): Promise<ProdutoAvaliacao> {
  const client = getClient(pb)
  
  const avaliacaoData: Partial<ProdutoAvaliacao> = {
    produto_id: produtoId,
    cliente_id: clienteId,
    pedido_id: pedidoId,
    nota,
    comentario,
    data_compra: new Date().toISOString(),
    verificada: true, // Como vem de uma compra real
    status: 'ativa',
    cliente: tenantId,
  }
  
  return client.collection('produto_avaliacoes').create(avaliacaoData) as Promise<ProdutoAvaliacao>
}

export async function responderAvaliacao(
  avaliacaoId: string,
  respostaVendor: string,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  return client.collection('produto_avaliacoes').update(avaliacaoId, {
    resposta_vendor: respostaVendor,
    data_resposta: new Date().toISOString()
  }) as Promise<ProdutoAvaliacao>
}

// ========== NOTIFICAÇÕES ==========

export async function fetchNotificacoes(
  vendorId: string,
  tenantId: string,
  apenasNaoLidas = false,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  let filter = `vendor_id = "${vendorId}" && cliente = "${tenantId}"`
  
  if (apenasNaoLidas) {
    filter += ` && lida = false`
  }
  
  return client.collection('vendor_notifications').getFullList({
    filter,
    expand: 'vendor_id,cliente',
    sort: '-created',
  }) as Promise<VendorNotificacao[]>
}

export async function criarNotificacao(
  vendorId: string,
  tipo: VendorNotificacao['tipo'],
  titulo: string,
  mensagem: string,
  tenantId: string,
  link?: string,
  dadosExtras?: Record<string, any>,
  pb?: PocketBase
): Promise<VendorNotificacao> {
  const client = getClient(pb)
  
  const notificacaoData: Partial<VendorNotificacao> = {
    vendor_id: vendorId,
    tipo,
    titulo,
    mensagem,
    link,
    dados_extras: dadosExtras,
    lida: false,
    cliente: tenantId,
  }
  
  return client.collection('vendor_notifications').create(notificacaoData) as Promise<VendorNotificacao>
}

export async function marcarNotificacaoComoLida(
  notificacaoId: string,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  return client.collection('vendor_notifications').update(notificacaoId, {
    lida: true,
    data_leitura: new Date().toISOString()
  }) as Promise<VendorNotificacao>
}

// ========== CONFIGURAÇÕES ==========

export async function fetchMarketplaceConfig(tenantId: string, pb?: PocketBase): Promise<MarketplaceConfig | null> {
  const client = getClient(pb)
  
  try {
    const config = await client.collection('marketplace_config').getFirstListItem(
      `cliente = "${tenantId}"`,
      { expand: 'cliente' }
    )
    return config as MarketplaceConfig
  } catch (error) {
    return null
  }
}

export async function updateMarketplaceConfig(
  configData: Partial<MarketplaceConfig>,
  tenantId: string,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  const existingConfig = await fetchMarketplaceConfig(tenantId, pb)
  
  if (existingConfig) {
    return client.collection('marketplace_config').update(existingConfig.id, configData) as Promise<MarketplaceConfig>
  } else {
    return client.collection('marketplace_config').create({
      ...configData,
      cliente: tenantId
    }) as Promise<MarketplaceConfig>
  }
}

// ========== FUNÇÕES UTILITÁRIAS ==========

export async function verificarVendorAuth(userId: string, tenantId: string, pb?: PocketBase): Promise<Vendor | null> {
  const client = getClient(pb)
  
  try {
    // Verificar se o usuário tem vendor_id
    const usuario = await client.collection('usuarios').getOne(userId)
    
    if (!usuario.vendor_id) {
      return null
    }
    
    // Buscar o vendor
    const vendor = await fetchVendor(usuario.vendor_id, tenantId, pb)
    
    if (vendor.status !== 'ativo') {
      return null
    }
    
    return vendor
  } catch {
    return null
  }
}

export async function calcularComissaoPedido(
  pedidoId: string,
  tenantId: string,
  pb?: PocketBase
): Promise<void> {
  const client = getClient(pb)
  
  // Buscar o pedido com produtos
  const pedido = await client.collection('pedidos').getOne(pedidoId, {
    expand: 'produto'
  })
  
  if (pedido.cliente !== tenantId) {
    throw new Error('TENANT_MISMATCH')
  }
  
  // Verificar se já foi calculado
  if (pedido.comissao_calculada) {
    return
  }
  
  // Buscar configuração do marketplace
  const config = await fetchMarketplaceConfig(tenantId, pb)
  const comissaoPadrao = config?.comissao_padrao || 0
  
  let comissaoTotal = 0
  const vendorIds: string[] = []
  
  // Processar cada produto do pedido
  const produtos = Array.isArray(pedido.expand?.produto) ? pedido.expand.produto : [pedido.expand?.produto]
  
  for (const produto of produtos.filter(Boolean)) {
    if (produto.vendor_id && produto.origem === 'vendor') {
      const valorVenda = parseFloat(pedido.valor) / produtos.length // Dividir valor entre produtos
      const percentualComissao = comissaoPadrao
      const valorComissao = (valorVenda * percentualComissao) / 100
      
      // Criar comissão
      await calcularComissao(
        produto.vendor_id,
        pedidoId,
        produto.id,
        produto.nome,
        pedido.email || 'Cliente',
        valorVenda,
        percentualComissao,
        tenantId,
        pb
      )
      
      comissaoTotal += valorComissao
      
      if (!vendorIds.includes(produto.vendor_id)) {
        vendorIds.push(produto.vendor_id)
      }
    }
  }
  
  // Atualizar pedido
  await client.collection('pedidos').update(pedidoId, {
    gera_comissao: vendorIds.length > 0,
    comissao_calculada: true,
    comissao_valor_total: comissaoTotal,
    vendor_ids: vendorIds
  })
}