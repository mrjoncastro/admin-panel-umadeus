import createPocketBase, { createTenantPocketBase, getCurrentTenantId } from '@/lib/pocketbase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const tenantId = getCurrentTenantId()
    
    if (!tenantId) {
      return NextResponse.json({ 
        error: 'Tenant não identificado' 
      }, { status: 400 })
    }

    // Usando createTenantPocketBase para filtro automático
    const pb = createTenantPocketBase()
    
    // Esta consulta já será filtrada automaticamente pelo tenant
    const config = await pb.collection('clientes_config').getFirstListItem('')
    
    return NextResponse.json({
      tenantId,
      config: {
        cor_primary: config.cor_primary,
        nome: config.nome,
        logo: config.logo,
        font: config.font,
        confirma_inscricoes: config.confirma_inscricoes
      }
    })
  } catch (error) {
    console.error('Erro ao buscar configuração do tenant:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
