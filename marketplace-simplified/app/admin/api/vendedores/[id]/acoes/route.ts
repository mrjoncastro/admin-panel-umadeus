import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const authUserId = request.headers.get('x-user-id') // Assumindo que vem do middleware de auth

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 400 })
    }

    if (!authUserId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { acao, motivo } = body

    if (!['aprovar', 'rejeitar', 'suspender'].includes(acao)) {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

    // Configurar contexto multi-tenant
    await supabase.rpc('set_current_tenant', { tenant_id: tenantId })

    // Verificar se vendedor existe
    const { data: vendedor, error: vendedorError } = await supabase
      .from('vendedores')
      .select('id, status, nome, email')
      .eq('id', params.id)
      .eq('cliente', tenantId)
      .single()

    if (vendedorError || !vendedor) {
      return NextResponse.json({ error: 'Vendedor não encontrado' }, { status: 404 })
    }

    // Preparar dados de atualização
    const updateData: any = {
      updated: new Date().toISOString()
    }

    switch (acao) {
      case 'aprovar':
        if (vendedor.status !== 'pendente') {
          return NextResponse.json({ 
            error: 'Apenas vendedores pendentes podem ser aprovados' 
          }, { status: 400 })
        }
        updateData.status = 'aprovado'
        updateData.aprovado_por = authUserId
        updateData.aprovado_em = new Date().toISOString()
        updateData.rejeitado_motivo = null
        break

      case 'rejeitar':
        if (vendedor.status !== 'pendente') {
          return NextResponse.json({ 
            error: 'Apenas vendedores pendentes podem ser rejeitados' 
          }, { status: 400 })
        }
        if (!motivo) {
          return NextResponse.json({ 
            error: 'Motivo da rejeição é obrigatório' 
          }, { status: 400 })
        }
        updateData.status = 'rejeitado'
        updateData.rejeitado_motivo = motivo
        updateData.aprovado_por = null
        updateData.aprovado_em = null
        break

      case 'suspender':
        if (!['aprovado'].includes(vendedor.status)) {
          return NextResponse.json({ 
            error: 'Apenas vendedores aprovados podem ser suspensos' 
          }, { status: 400 })
        }
        updateData.status = 'suspenso'
        updateData.rejeitado_motivo = motivo || 'Suspenso pelo administrador'
        break
    }

    // Atualizar vendedor
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
      logger.error(`Erro ao ${acao} vendedor:`, error)
      return NextResponse.json({ error: `Erro ao ${acao} vendedor` }, { status: 500 })
    }

    // Se suspender, também precisamos suspender os produtos do vendedor
    if (acao === 'suspender') {
      await supabase
        .from('produtos')
        .update({ ativo: false })
        .eq('vendedor_id', params.id)
        .eq('cliente', tenantId)
    }

    // Log da ação
    logger.info(`Vendedor ${acao}:`, { 
      vendedorId: data.id, 
      nome: data.nome, 
      usuario: authUserId,
      motivo: motivo || undefined
    })

    // TODO: Enviar email de notificação para o vendedor

    return NextResponse.json({
      message: `Vendedor ${acao} com sucesso`,
      vendedor: data
    })

  } catch (error) {
    logger.error('Erro na ação de vendedor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}