import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 400 })
    }

    // Configurar contexto multi-tenant
    await supabase.rpc('set_current_tenant', { tenant_id: tenantId })

    const { data, error } = await supabase
      .from('vendedores')
      .select('id, nome, email, taxa_comissao')
      .eq('cliente', tenantId)
      .eq('status', 'aprovado')
      .order('nome')

    if (error) {
      logger.error('Erro ao buscar vendedores aprovados:', error)
      return NextResponse.json({ error: 'Erro ao buscar vendedores' }, { status: 500 })
    }

    return NextResponse.json(data)

  } catch (error) {
    logger.error('Erro na API de vendedores aprovados:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}