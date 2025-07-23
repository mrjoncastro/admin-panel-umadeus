import { NextRequest, NextResponse } from 'next/server'

const CATALOG_SERVICE_URL = process.env['CATALOG_SERVICE_URL'] || 'http://localhost:5000'

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID é obrigatório' },
        { status: 400 }
      )
    }

    const url = new URL(req.url)
    const searchParams = url.searchParams.toString()
    const catalogUrl = `${CATALOG_SERVICE_URL}/api/v1/products${searchParams ? `?${searchParams}` : ''}`

    const response = await fetch(catalogUrl, {
      headers: {
        'x-tenant-id': tenantId,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    logger.error('Erro ao consultar Catalog Service:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID é obrigatório' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const catalogUrl = `${CATALOG_SERVICE_URL}/api/v1/products`

    const response = await fetch(catalogUrl, {
      method: 'POST',
      headers: {
        'x-tenant-id': tenantId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    logger.error('Erro ao criar produto no Catalog Service:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} import { logger } from '@/lib/logger'
