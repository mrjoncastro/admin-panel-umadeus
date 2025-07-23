import { NextRequest, NextResponse } from 'next/server'

const CATALOG_SERVICE_URL = process.env['CATALOG_SERVICE_URL'] || 'http://localhost:5000'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = req.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID é obrigatório' },
        { status: 400 }
      )
    }

    const catalogUrl = `${CATALOG_SERVICE_URL}/api/v1/products/${params.id}`

    const response = await fetch(catalogUrl, {
      headers: {
        'x-tenant-id': tenantId,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    logger.error('Erro ao consultar produto no Catalog Service:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = req.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID é obrigatório' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const catalogUrl = `${CATALOG_SERVICE_URL}/api/v1/products/${params.id}`

    const response = await fetch(catalogUrl, {
      method: 'PATCH',
      headers: {
        'x-tenant-id': tenantId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    logger.error('Erro ao atualizar produto no Catalog Service:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = req.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID é obrigatório' },
        { status: 400 }
      )
    }

    const catalogUrl = `${CATALOG_SERVICE_URL}/api/v1/products/${params.id}`

    const response = await fetch(catalogUrl, {
      method: 'DELETE',
      headers: {
        'x-tenant-id': tenantId,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    logger.error('Erro ao deletar produto no Catalog Service:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} import { logger } from '@/lib/logger'
