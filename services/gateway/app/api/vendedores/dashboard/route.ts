import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireVendedorAuth } from '@/lib/vendedorAuth'
import { logger } from '@/lib/logger'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const GET = requireVendedorAuth(async (request: NextRequest, vendedor) => {
  try {
    // Configurar contexto multi-tenant
    await supabase.rpc('set_current_tenant', { tenant_id: vendedor.cliente })

    const hoje = new Date().toISOString().split('T')[0]
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const fimMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

    // Buscar estatísticas de hoje
    const { data: estatisticasHoje } = await supabase
      .from('vendedores_estatisticas')
      .select('*')
      .eq('vendedor_id', vendedor.id)
      .eq('periodo', hoje)
      .eq('cliente', vendedor.cliente)
      .single()

    // Buscar estatísticas do mês
    const { data: estatisticasMes } = await supabase
      .from('vendedores_estatisticas')
      .select(`
        vendas_quantidade,
        vendas_valor,
        comissoes_valor,
        produtos_visualizacoes,
        avaliacoes_recebidas,
        avaliacoes_media
      `)
      .eq('vendedor_id', vendedor.id)
      .eq('cliente', vendedor.cliente)
      .gte('periodo', inicioMes)
      .lte('periodo', fimMes)

    // Agregar estatísticas do mês
    const estatisticasAgregadas = estatisticasMes?.reduce((acc, curr) => ({
      vendas_quantidade: acc.vendas_quantidade + curr.vendas_quantidade,
      vendas_valor: acc.vendas_valor + curr.vendas_valor,
      comissoes_valor: acc.comissoes_valor + curr.comissoes_valor,
      produtos_visualizacoes: acc.produtos_visualizacoes + curr.produtos_visualizacoes,
      avaliacoes_recebidas: acc.avaliacoes_recebidas + curr.avaliacoes_recebidas,
      avaliacoes_media: curr.avaliacoes_media // usar a mais recente
    }), {
      vendas_quantidade: 0,
      vendas_valor: 0,
      comissoes_valor: 0,
      produtos_visualizacoes: 0,
      avaliacoes_recebidas: 0,
      avaliacoes_media: 0
    })

    // Buscar pedidos pendentes (últimos 10)
    const { data: pedidosPendentes } = await supabase
      .from('pedidos_vendedores')
      .select(`
        *,
        pedido:pedidos!pedidos_vendedores_pedido_id_fkey(
          id,
          email,
          status,
          created
        ),
        produto:produtos!pedidos_vendedores_produto_id_fkey(
          id,
          nome,
          imagens
        )
      `)
      .eq('vendedor_id', vendedor.id)
      .eq('cliente', vendedor.cliente)
      .in('status', ['pendente', 'processando'])
      .order('created', { ascending: false })
      .limit(10)

    // Buscar produtos pendentes de aprovação
    const { data: produtosPendentes } = await supabase
      .from('produtos')
      .select(`
        id,
        nome,
        preco,
        imagens,
        status_aprovacao,
        created
      `)
      .eq('vendedor_id', vendedor.id)
      .eq('cliente', vendedor.cliente)
      .eq('status_aprovacao', 'pendente')
      .order('created', { ascending: false })
      .limit(5)

    // Buscar avaliações recentes
    const { data: avaliacoesRecentes } = await supabase
      .from('avaliacoes_vendedores')
      .select(`
        *,
        usuario:usuarios!avaliacoes_vendedores_usuario_id_fkey(
          id,
          nome
        )
      `)
      .eq('vendedor_id', vendedor.id)
      .eq('cliente', vendedor.cliente)
      .order('created', { ascending: false })
      .limit(5)

    // Contar notificações não lidas
    const { count: notificacaoNaoLidas } = await supabase
      .from('vendedores_notificacoes')
      .select('*', { count: 'exact', head: true })
      .eq('vendedor_id', vendedor.id)
      .eq('cliente', vendedor.cliente)
      .eq('lida', false)

    // Buscar repasse pendente mais recente
    const { data: repassePendente } = await supabase
      .from('vendedores_repasses')
      .select('*')
      .eq('vendedor_id', vendedor.id)
      .eq('cliente', vendedor.cliente)
      .eq('status', 'pendente')
      .order('created', { ascending: false })
      .limit(1)
      .single()

    // Calcular crescimento comparado ao mês anterior
    const inicioMesAnterior = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0]
    const fimMesAnterior = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]

    const { data: estatisticasMesAnterior } = await supabase
      .from('vendedores_estatisticas')
      .select('vendas_valor, comissoes_valor')
      .eq('vendedor_id', vendedor.id)
      .eq('cliente', vendedor.cliente)
      .gte('periodo', inicioMesAnterior)
      .lte('periodo', fimMesAnterior)

    const totalMesAnterior = estatisticasMesAnterior?.reduce((acc, curr) => ({
      vendas_valor: acc.vendas_valor + curr.vendas_valor,
      comissoes_valor: acc.comissoes_valor + curr.comissoes_valor
    }), { vendas_valor: 0, comissoes_valor: 0 })

    // Calcular percentuais de crescimento
    const crescimentoVendas = totalMesAnterior?.vendas_valor > 0 
      ? ((estatisticasAgregadas?.vendas_valor || 0) - totalMesAnterior.vendas_valor) / totalMesAnterior.vendas_valor * 100
      : 0

    const crescimentoComissoes = totalMesAnterior?.comissoes_valor > 0
      ? ((estatisticasAgregadas?.comissoes_valor || 0) - totalMesAnterior.comissoes_valor) / totalMesAnterior.comissoes_valor * 100
      : 0

    const dashboard = {
      vendedor: {
        id: vendedor.id,
        nome: vendedor.nome,
        email: vendedor.email,
        status: vendedor.status,
        taxa_comissao: vendedor.taxa_comissao,
        total_produtos: vendedor.total_produtos,
        total_vendas: vendedor.total_vendas,
        avaliacao_media: vendedor.avaliacao_media,
        logo_url: vendedor.logo_url,
        banner_url: vendedor.banner_url
      },
      estatisticas_hoje: estatisticasHoje || {
        vendas_quantidade: 0,
        vendas_valor: 0,
        comissoes_valor: 0,
        produtos_visualizacoes: 0,
        avaliacoes_recebidas: 0,
        avaliacoes_media: 0
      },
      estatisticas_mes: estatisticasAgregadas || {
        vendas_quantidade: 0,
        vendas_valor: 0,
        comissoes_valor: 0,
        produtos_visualizacoes: 0,
        avaliacoes_recebidas: 0,
        avaliacoes_media: 0
      },
      crescimento: {
        vendas: Number(crescimentoVendas.toFixed(2)),
        comissoes: Number(crescimentoComissoes.toFixed(2))
      },
      pedidos_pendentes: pedidosPendentes || [],
      produtos_pendentes: produtosPendentes || [],
      avaliacoes_recentes: avaliacoesRecentes || [],
      notificacoes_nao_lidas: notificacaoNaoLidas || 0,
      repasse_pendente: repassePendente
    }

    return NextResponse.json(dashboard)

  } catch (error) {
    logger.error('Erro ao buscar dashboard do vendedor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
})