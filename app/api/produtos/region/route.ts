import { NextRequest, NextResponse } from 'next/server'
import { buscarProdutosVisiveisPorSubdominio } from '@/lib/services/product-visibility'
import type { FiltrosProdutoVisibilidade } from '@/types/product-visibility'

export async function GET(request: NextRequest) {
  try {
    // Extrair filtros dos parâmetros da URL
    const { searchParams } = new URL(request.url)
    
    const filtros: Partial<FiltrosProdutoVisibilidade> = {}
    
    // Filtros básicos
    if (searchParams.get('categoria')) {
      // Nota: este filtro seria aplicado na consulta do produto, não da visibilidade
      // Aqui é apenas um exemplo de como seria estruturado
    }
    
    if (searchParams.get('nivel_visibilidade')) {
      filtros.nivel_visibilidade = searchParams.get('nivel_visibilidade')?.split(',') as any
    }
    
    if (searchParams.get('status_autorizacao')) {
      filtros.status_autorizacao = searchParams.get('status_autorizacao')?.split(',') as any
    }
    
    if (searchParams.get('criado_por')) {
      filtros.criado_por = searchParams.get('criado_por') || undefined
    }
    
    if (searchParams.get('data_inicio')) {
      filtros.data_inicio = searchParams.get('data_inicio') || undefined
    }
    
    if (searchParams.get('data_fim')) {
      filtros.data_fim = searchParams.get('data_fim') || undefined
    }
    
    // Buscar produtos visíveis para esta região
    const produtos = await buscarProdutosVisiveisPorSubdominio(request, filtros)
    
    // Extrair informações da região dos headers
    const regionInfo = {
      regionId: request.headers.get('x-region-id'),
      estadoId: request.headers.get('x-estado-id'),
      cidadeId: request.headers.get('x-cidade-id'),
      subdomain: request.headers.get('x-subdomain'),
      tenantId: request.headers.get('x-tenant-id')
    }
    
    return NextResponse.json({
      success: true,
      produtos: produtos.map(p => ({
        id: p.id,
        produto_id: p.produto_id,
        nivel_visibilidade: p.nivel_visibilidade_atual,
        status_autorizacao: p.status_autorizacao,
        territorios_visiveis: p.territorios_visiveis,
        criado_por: p.criado_por,
        nivel_criador: p.nivel_criador,
        created: p.created,
        // Expandir dados do produto se necessário
        produto: p.expand?.produto_id || null
      })),
      pagination: {
        total: produtos.length,
        page: 1,
        perPage: produtos.length
      },
      region: regionInfo,
      filtros_aplicados: filtros
    })
    
  } catch (error) {
    console.error('Erro ao buscar produtos da região:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// POST para buscar com filtros mais complexos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filtros, pagination } = body as {
      filtros?: Partial<FiltrosProdutoVisibilidade>
      pagination?: { page?: number; perPage?: number }
    }
    
    // Buscar produtos visíveis para esta região
    const produtos = await buscarProdutosVisiveisPorSubdominio(request, filtros)
    
    // Aplicar paginação se fornecida
    const page = pagination?.page || 1
    const perPage = pagination?.perPage || 20
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedProdutos = produtos.slice(startIndex, endIndex)
    
    // Extrair informações da região dos headers
    const regionInfo = {
      regionId: request.headers.get('x-region-id'),
      estadoId: request.headers.get('x-estado-id'),
      cidadeId: request.headers.get('x-cidade-id'),
      subdomain: request.headers.get('x-subdomain'),
      tenantId: request.headers.get('x-tenant-id')
    }
    
    return NextResponse.json({
      success: true,
      produtos: paginatedProdutos.map(p => ({
        id: p.id,
        produto_id: p.produto_id,
        nivel_visibilidade: p.nivel_visibilidade_atual,
        status_autorizacao: p.status_autorizacao,
        territorios_visiveis: p.territorios_visiveis,
        criado_por: p.criado_por,
        nivel_criador: p.nivel_criador,
        metricas: p.metricas,
        created: p.created,
        updated: p.updated,
        // Expandir dados do produto se necessário
        produto: p.expand?.produto_id || null
      })),
      pagination: {
        total: produtos.length,
        page,
        perPage,
        totalPages: Math.ceil(produtos.length / perPage),
        hasNext: endIndex < produtos.length,
        hasPrev: page > 1
      },
      region: regionInfo,
      filtros_aplicados: filtros || {},
      estatisticas: {
        total_produtos: produtos.length,
        por_nivel: produtos.reduce((acc, p) => {
          acc[p.nivel_visibilidade_atual] = (acc[p.nivel_visibilidade_atual] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        por_status: produtos.reduce((acc, p) => {
          acc[p.status_autorizacao] = (acc[p.status_autorizacao] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar produtos da região:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}