import { NextRequest, NextResponse } from 'next/server'
import { detectRegionFromSubdomain } from '@/lib/services/subdomain-detection'

export async function POST(request: NextRequest) {
  try {
    const { hostname } = await request.json()
    
    if (!hostname) {
      return NextResponse.json(
        { error: 'Hostname é obrigatório' },
        { status: 400 }
      )
    }
    
    const region = await detectRegionFromSubdomain(hostname)
    
    return NextResponse.json({
      success: true,
      region,
      territory: {
        estado_id: region.estadoId || '',
        regiao_id: region.regionId || '',
        cidade_id: region.cidadeId || ''
      }
    })
    
  } catch (error) {
    console.error('Erro ao detectar região:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Usar hostname do próprio request
    const hostname = request.headers.get('host') || ''
    
    const region = await detectRegionFromSubdomain(hostname)
    
    return NextResponse.json({
      success: true,
      region,
      territory: {
        estado_id: region.estadoId || '',
        regiao_id: region.regionId || '',
        cidade_id: region.cidadeId || ''
      },
      subdomain: region.subdomain,
      tenantId: region.tenantId,
      isValid: region.isValid
    })
    
  } catch (error) {
    console.error('Erro ao detectar região:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}