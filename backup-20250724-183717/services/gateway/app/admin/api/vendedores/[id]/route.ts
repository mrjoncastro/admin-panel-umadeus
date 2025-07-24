import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 400 })
    }

    // Configurar contexto multi-tenant
    await supabase.rpc('set_current_tenant', { tenant_id: tenantId })

    const { data, error } = await supabase
      .from('vendedores')
      .select(`
        *,
        aprovado_por:usuarios!vendedores_aprovado_por_fkey(id, nome),
        documentos:vendedores_documentos(*)
      `)
      .eq('id', params.id)
      .eq('cliente', tenantId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Vendedor não encontrado' }, { status: 404 })
      }
      logger.error('Erro ao buscar vendedor:', error)
      return NextResponse.json({ error: 'Erro ao buscar vendedor' }, { status: 500 })
    }

    return NextResponse.json(data)

  } catch (error) {
    logger.error('Erro na API de vendedor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 400 })
    }

    const body = await request.json()

    // Configurar contexto multi-tenant
    await supabase.rpc('set_current_tenant', { tenant_id: tenantId })

    // Verificar se vendedor existe
    const { data: existing } = await supabase
      .from('vendedores')
      .select('id')
      .eq('id', params.id)
      .eq('cliente', tenantId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Vendedor não encontrado' }, { status: 404 })
    }

    // Atualizar vendedor
    const updateData: any = {
      updated: new Date().toISOString()
    }

    // Campos permitidos para atualização
    const allowedFields = [
      'nome', 'email', 'telefone', 'endereco', 'cidade', 'estado', 'cep',
      'taxa_comissao', 'bio', 'site_url', 'instagram', 'facebook', 'whatsapp',
      'banco', 'agencia', 'conta', 'tipo_conta', 'pix_key',
      'aceita_devolvidos', 'tempo_processamento', 'politica_troca', 'politica_devolucao'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    const { data, error } = await supabase
      .from('vendedores')
      .update(updateData)
      .eq('id', params.id)
      .eq('cliente', tenantId)
      .select(`
        *,
        aprovado_por:usuarios!vendedores_aprovado_por_fkey(id, nome)
      `)
      .single()

    if (error) {
      logger.error('Erro ao atualizar vendedor:', error)
      return NextResponse.json({ error: 'Erro ao atualizar vendedor' }, { status: 500 })
    }

    logger.info('Vendedor atualizado:', { vendedorId: data.id, nome: data.nome })
    return NextResponse.json(data)

  } catch (error) {
    logger.error('Erro na atualização de vendedor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 400 })
    }

    // Configurar contexto multi-tenant
    await supabase.rpc('set_current_tenant', { tenant_id: tenantId })

    // Verificar se vendedor tem produtos associados
    const { data: produtos } = await supabase
      .from('produtos')
      .select('id')
      .eq('vendedor_id', params.id)
      .eq('cliente', tenantId)

    if (produtos && produtos.length > 0) {
      return NextResponse.json({ 
        error: 'Não é possível excluir vendedor com produtos cadastrados' 
      }, { status: 409 })
    }

    const { error } = await supabase
      .from('vendedores')
      .delete()
      .eq('id', params.id)
      .eq('cliente', tenantId)

    if (error) {
      logger.error('Erro ao excluir vendedor:', error)
      return NextResponse.json({ error: 'Erro ao excluir vendedor' }, { status: 500 })
    }

    logger.info('Vendedor excluído:', { vendedorId: params.id })
    return NextResponse.json({ message: 'Vendedor excluído com sucesso' })

  } catch (error) {
    logger.error('Erro na exclusão de vendedor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}