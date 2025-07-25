import type PocketBase from 'pocketbase'
import type { 
  Vendor, 
  ProdutoMarketplace, 
  Comissao, 
  SaqueComissao,
  VendorAnalytics,
  MarketplaceConfig,
  ProdutoAvaliacao 
} from '../../types/marketplace'
import createPocketBase from '../pocketbase'

function getClient(pb?: PocketBase): PocketBase {
  return pb ?? createPocketBase()
}

// ========== VENDORS ==========

export async function fetchVendors(tenantId: string, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('vendors').getFullList({
    filter: `cliente = "${tenantId}"`,
    sort: '-created',
  })
}

export async function fetchVendor(vendorId: string, tenantId: string, pb?: PocketBase) {
  const client = getClient(pb)
  const vendor = await client.collection('vendors').getOne(vendorId, {
    expand: 'metricas'
  })
  
  if (vendor.cliente !== tenantId) {
    throw new Error('TENANT_MISMATCH')
  }
  
  return vendor as Vendor
}

export async function createVendor(vendorData: Partial<Vendor>, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('vendors').create(vendorData)
}

export async function updateVendor(vendorId: string, vendorData: Partial<Vendor>, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('vendors').update(vendorId, vendorData)
}

export async function aprovarVendor(vendorId: string, aprovadoPor: string, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('vendors').update(vendorId, {
    status: 'ativo',
    data_aprovacao: new Date().toISOString(),
    aprovado_por: aprovadoPor
  })
}

export async function rejeitarVendor(vendorId: string, motivo: string, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('vendors').update(vendorId, {
    status: 'rejeitado',
    motivo_rejeicao: motivo
  })
}

// ========== PRODUTOS MARKETPLACE ==========

export async function fetchProdutosMarketplace(
  tenantId: string, 
  filtros?: {
    vendorId?: string
    status?: string
    categoria?: string
    aprovado?: boolean
  },
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  let filter = `cliente = "${tenantId}"`
  
  if (filtros?.vendorId) {
    filter += ` && vendor_id = "${filtros.vendorId}"`
  }
  
  if (filtros?.status) {
    filter += ` && moderacao_status = "${filtros.status}"`
  }
  
  if (filtros?.categoria) {
    filter += ` && categoria = "${filtros.categoria}"`
  }
  
  if (filtros?.aprovado !== undefined) {
    filter += ` && aprovado = ${filtros.aprovado}`
  }
  
  return client.collection('produtos').getFullList({
    filter,
    expand: 'vendor,categoria,avaliacoes',
    sort: '-created',
  })
}

export async function fetchProdutoMarketplace(produtoId: string, tenantId: string, pb?: PocketBase) {
  const client = getClient(pb)
  const produto = await client.collection('produtos').getOne(produtoId, {
    expand: 'vendor,categoria,avaliacoes'
  })
  
  if (produto.cliente !== tenantId) {
    throw new Error('TENANT_MISMATCH')
  }
  
  return produto as ProdutoMarketplace
}

export async function aprovarProduto(produtoId: string, aprovadoPor: string, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('produtos').update(produtoId, {
    aprovado: true,
    moderacao_status: 'aprovado',
    data_aprovacao: new Date().toISOString(),
    aprovado_por: aprovadoPor
  })
}

export async function rejeitarProduto(produtoId: string, motivo: string, pb?: PocketBase) {
  const client = getClient(pb)
  return client.collection('produtos').update(produtoId, {
    aprovado: false,
    moderacao_status: 'rejeitado',
    motivo_rejeicao: motivo
  })
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
    filter += ` && created >= "${filtros.periodo.inicio}" && created <= "${filtros.periodo.fim}"`
  }
  
  return client.collection('comissoes').getFullList({
    filter,
    expand: 'vendor,pedido,produto',
    sort: '-created',
  })
}

export async function calcularComissao(
  vendorId: string,
  pedidoId: string,
  produtoId: string,
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
    valor_venda: valorVenda,
    percentual_comissao: percentualComissao,
    valor_comissao: valorComissao,
    status: 'pendente',
    cliente: tenantId,
  }
  
  return client.collection('comissoes').create(comissaoData)
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

export async function solicitarSaque(
  vendorId: string,
  valorSolicitado: number,
  comissoesIds: string[],
  tenantId: string,
  pb?: PocketBase
): Promise<SaqueComissao> {
  const client = getClient(pb)
  
  const saqueData: Partial<SaqueComissao> = {
    vendor_id: vendorId,
    valor_solicitado: valorSolicitado,
    comissoes_ids: comissoesIds,
    status: 'solicitado',
    data_solicitacao: new Date().toISOString(),
    cliente: tenantId,
  }
  
  return client.collection('saques_comissao').create(saqueData)
}

export async function processarSaque(
  saqueId: string,
  processadoPor: string,
  taxaSaque: number,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  const saque = await client.collection('saques_comissao').getOne(saqueId)
  const valorLiquido = saque.valor_solicitado - taxaSaque
  
  return client.collection('saques_comissao').update(saqueId, {
    status: 'processando',
    data_processamento: new Date().toISOString(),
    processado_por: processadoPor,
    taxa_saque: taxaSaque,
    valor_liquido: valorLiquido
  })
}

export async function confirmarPagamentoSaque(
  saqueId: string,
  comprovante: string,
  pb?: PocketBase
) {
  const client = getClient(pb)
  
  return client.collection('saques_comissao').update(saqueId, {
    status: 'pago',
    data_pagamento: new Date().toISOString(),
    comprovante: comprovante
  })
}

// ========== ANALYTICS ==========

export async function gerarAnalyticsVendor(
  vendorId: string,
  periodo: string,
  tenantId: string,
  pb?: PocketBase
): Promise<VendorAnalytics> {
  const client = getClient(pb)
  
  // Buscar dados do período
  const inicioPeriodo = `${periodo}-01`
  const fimPeriodo = new Date(parseInt(periodo.split('-')[0]), parseInt(periodo.split('-')[1]), 0)
    .toISOString()
  
  // Buscar vendas do período
  const vendas = await client.collection('pedidos').getFullList({
    filter: `vendor_id = "${vendorId}" && status = "pago" && created >= "${inicioPeriodo}" && created < "${fimPeriodo.split('T')[0]}"`
  })
  
  // Buscar produtos cadastrados
  const produtos = await client.collection('produtos').getFullList({
    filter: `vendor_id = "${vendorId}" && created >= "${inicioPeriodo}" && created < "${fimPeriodo.split('T')[0]}"`
  })
  
  // Calcular métricas
  const vendasQuantidade = vendas.length
  const vendasValor = vendas.reduce((sum, venda) => sum + parseFloat(venda.valor), 0)
  const ticketMedio = vendasQuantidade > 0 ? vendasValor / vendasQuantidade : 0
  
  const analyticsData: Partial<VendorAnalytics> = {
    vendor_id: vendorId,
    periodo,
    vendas_quantidade: vendasQuantidade,
    vendas_valor: vendasValor,
    produtos_cadastrados: produtos.length,
    produtos_aprovados: produtos.filter(p => p.aprovado).length,
    ticket_medio: ticketMedio,
    cliente: tenantId,
  }
  
  return client.collection('vendor_analytics').create(analyticsData)
}

// ========== AVALIAÇÕES ==========

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
  
  return client.collection('produto_avaliacoes').create(avaliacaoData)
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
  })
}

// ========== CONFIGURAÇÕES ==========

export async function fetchMarketplaceConfig(tenantId: string, pb?: PocketBase): Promise<MarketplaceConfig | null> {
  const client = getClient(pb)
  
  try {
    const config = await client.collection('marketplace_config').getFirstListItem(
      `cliente = "${tenantId}"`
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
    return client.collection('marketplace_config').update(existingConfig.id, configData)
  } else {
    return client.collection('marketplace_config').create({
      ...configData,
      cliente: tenantId
    })
  }
}

// ========== CACHE E PERFORMANCE ==========

export async function atualizarCacheProduto(produtoId: string, pb?: PocketBase) {
  const client = getClient(pb)
  
  // Buscar dados do produto
  const produto = await client.collection('produtos').getOne(produtoId, {
    expand: 'vendor,avaliacoes'
  })
  
  // Calcular métricas de popularidade
  const visualizacoes24h = 0 // Implementar analytics de visualizações
  const vendas7d = 0 // Implementar contagem de vendas dos últimos 7 dias
  const scorePopularidade = (visualizacoes24h * 0.3) + (vendas7d * 0.7)
  
  const cacheData = {
    produto_id: produtoId,
    dados_produto: produto,
    visualizacoes_24h: visualizacoes24h,
    vendas_7d: vendas7d,
    score_popularidade: scorePopularidade,
    ultima_atualizacao: new Date().toISOString(),
    cliente: produto.cliente
  }
  
  // Verificar se já existe cache
  try {
    const existingCache = await client.collection('produto_cache').getFirstListItem(
      `produto_id = "${produtoId}"`
    )
    return client.collection('produto_cache').update(existingCache.id, cacheData)
  } catch {
    return client.collection('produto_cache').create(cacheData)
  }
}

export async function buscarProdutosPopulares(tenantId: string, limite = 10, pb?: PocketBase) {
  const client = getClient(pb)
  
  return client.collection('produto_cache').getList(1, limite, {
    filter: `cliente = "${tenantId}"`,
    sort: '-score_popularidade',
    expand: 'dados_produto.vendor'
  })
}