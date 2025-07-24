import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 400 })
    }

    const { pedido_id } = await request.json()

    if (!pedido_id) {
      return NextResponse.json({ error: 'ID do pedido é obrigatório' }, { status: 400 })
    }

    // Configurar contexto multi-tenant
    await supabase.rpc('set_current_tenant', { tenant_id: tenantId })

    // Buscar pedido e produtos
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select(`
        id,
        valor,
        status,
        email,
        cliente,
        created,
        produto_ids:pedidos_produtos(produto_id)
      `)
      .eq('id', pedido_id)
      .eq('cliente', tenantId)
      .single()

    if (pedidoError || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Buscar produtos do pedido com informações do vendedor
    const produtoIds = pedido.produto_ids?.map(p => p.produto_id) || []
    
    if (produtoIds.length === 0) {
      return NextResponse.json({ error: 'Pedido sem produtos' }, { status: 400 })
    }

    const { data: produtos, error: produtosError } = await supabase
      .from('produtos')
      .select(`
        id,
        nome,
        preco,
        custo,
        margem_vendedor,
        vendedor_id,
        vendedor:vendedores!produtos_vendedor_id_fkey(
          id,
          nome,
          taxa_comissao
        )
      `)
      .in('id', produtoIds)
      .eq('cliente', tenantId)

    if (produtosError) {
      logger.error('Erro ao buscar produtos:', produtosError)
      return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
    }

    // Verificar se já existe split para este pedido
    const { data: splitExistente } = await supabase
      .from('pedidos_vendedores')
      .select('id')
      .eq('pedido_id', pedido_id)
      .eq('cliente', tenantId)

    if (splitExistente && splitExistente.length > 0) {
      return NextResponse.json({ 
        message: 'Split já existe para este pedido',
        splits: splitExistente 
      })
    }

    // Criar splits para cada produto que tem vendedor
    const splits = []
    const notificacoes = []

    for (const produto of produtos) {
      if (produto.vendedor_id && produto.vendedor) {
        // Calcular valores
        const valorProduto = Number(produto.preco)
        const valorCusto = Number(produto.custo) || 0
        const taxaComissao = Number(produto.vendedor.taxa_comissao) || Number(produto.margem_vendedor) || 0
        const valorComissao = (valorProduto * taxaComissao) / 100

        const splitData = {
          pedido_id: pedido.id,
          vendedor_id: produto.vendedor_id,
          produto_id: produto.id,
          quantidade: 1, // TODO: implementar quantidade quando necessário
          valor_produto: valorProduto,
          valor_custo: valorCusto,
          valor_comissao: valorComissao,
          taxa_comissao: taxaComissao,
          status: 'pendente',
          cliente: tenantId
        }

        const { data: split, error: splitError } = await supabase
          .from('pedidos_vendedores')
          .insert(splitData)
          .select()
          .single()

        if (splitError) {
          logger.error('Erro ao criar split:', splitError)
          continue
        }

        splits.push(split)

        // Criar notificação para o vendedor
        const notificacao = {
          vendedor_id: produto.vendedor_id,
          tipo: 'pedido',
          titulo: 'Novo Pedido Recebido',
          mensagem: `Você recebeu um novo pedido para ${produto.nome}. Valor: R$ ${valorProduto.toFixed(2)}`,
          link: `/vendedores/pedidos/${split.id}`,
          dados_extras: {
            pedido_id: pedido.id,
            produto_id: produto.id,
            valor: valorProduto,
            comissao: valorComissao
          },
          cliente: tenantId
        }

        notificacoes.push(notificacao)
      }
    }

    // Inserir notificações em lote
    if (notificacoes.length > 0) {
      const { error: notificacoesError } = await supabase
        .from('vendedores_notificacoes')
        .insert(notificacoes)

      if (notificacoesError) {
        logger.error('Erro ao criar notificações:', notificacoesError)
      }
    }

    // Atualizar status do pedido principal
    await supabase
      .from('pedidos')
      .update({ status: 'processando' })
      .eq('id', pedido_id)
      .eq('cliente', tenantId)

    logger.info('Split de pedido criado:', {
      pedido_id,
      splits_criados: splits.length,
      vendedores_notificados: notificacoes.length,
      cliente: tenantId
    })

    return NextResponse.json({
      message: 'Split criado com sucesso',
      pedido_id,
      splits_criados: splits.length,
      splits: splits.map(s => ({
        id: s.id,
        vendedor_id: s.vendedor_id,
        produto_id: s.produto_id,
        valor_produto: s.valor_produto,
        valor_comissao: s.valor_comissao,
        status: s.status
      }))
    })

  } catch (error) {
    logger.error('Erro no split de pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// API para buscar splits de um pedido
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const pedidoId = searchParams.get('pedido_id')

    if (!pedidoId) {
      return NextResponse.json({ error: 'ID do pedido é obrigatório' }, { status: 400 })
    }

    // Configurar contexto multi-tenant
    await supabase.rpc('set_current_tenant', { tenant_id: tenantId })

    const { data: splits, error } = await supabase
      .from('pedidos_vendedores')
      .select(`
        *,
        vendedor:vendedores!pedidos_vendedores_vendedor_id_fkey(
          id,
          nome,
          email,
          taxa_comissao
        ),
        produto:produtos!pedidos_vendedores_produto_id_fkey(
          id,
          nome,
          preco,
          imagens
        ),
        pedido:pedidos!pedidos_vendedores_pedido_id_fkey(
          id,
          email,
          status,
          created
        )
      `)
      .eq('pedido_id', pedidoId)
      .eq('cliente', tenantId)
      .order('created', { ascending: false })

    if (error) {
      logger.error('Erro ao buscar splits:', error)
      return NextResponse.json({ error: 'Erro ao buscar splits' }, { status: 500 })
    }

    return NextResponse.json({
      pedido_id: pedidoId,
      splits: splits || []
    })

  } catch (error) {
    logger.error('Erro na consulta de splits:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}