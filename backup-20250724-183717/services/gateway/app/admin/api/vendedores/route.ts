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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabase
      .from('vendedores')
      .select(`
        *,
        aprovado_por:usuarios!vendedores_aprovado_por_fkey(id, nome)
      `)
      .eq('cliente', tenantId)

    // Filtros
    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%,cpf_cnpj.ilike.%${search}%`)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('created', { ascending: false })

    if (error) {
      logger.error('Erro ao buscar vendedores:', error)
      return NextResponse.json({ error: 'Erro ao buscar vendedores' }, { status: 500 })
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    logger.error('Erro na API de vendedores:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 400 })
    }

    const body = await request.json()
    
    // Validações básicas
    if (!body.nome || !body.email || !body.cpf_cnpj || !body.tipo_pessoa) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: nome, email, cpf_cnpj, tipo_pessoa' 
      }, { status: 400 })
    }

    // Configurar contexto multi-tenant
    await supabase.rpc('set_current_tenant', { tenant_id: tenantId })

    // Verificar se já existe vendedor com mesmo email ou CPF/CNPJ
    const { data: existing } = await supabase
      .from('vendedores')
      .select('id')
      .eq('cliente', tenantId)
      .or(`email.eq.${body.email},cpf_cnpj.eq.${body.cpf_cnpj}`)
      .single()

    if (existing) {
      return NextResponse.json({ 
        error: 'Já existe um vendedor com este email ou CPF/CNPJ' 
      }, { status: 409 })
    }

    // Criar vendedor
    const vendedorData = {
      nome: body.nome,
      email: body.email,
      telefone: body.telefone,
      cpf_cnpj: body.cpf_cnpj,
      tipo_pessoa: body.tipo_pessoa,
      razao_social: body.razao_social,
      nome_fantasia: body.nome_fantasia,
      endereco: body.endereco,
      cidade: body.cidade,
      estado: body.estado,
      cep: body.cep,
      taxa_comissao: body.taxa_comissao || 15.00,
      bio: body.bio,
      site_url: body.site_url,
      instagram: body.instagram,
      facebook: body.facebook,
      whatsapp: body.whatsapp,
      banco: body.banco,
      agencia: body.agencia,
      conta: body.conta,
      tipo_conta: body.tipo_conta,
      pix_key: body.pix_key,
      aceita_devolvidos: body.aceita_devolvidos ?? true,
      tempo_processamento: body.tempo_processamento || 2,
      politica_troca: body.politica_troca,
      politica_devolucao: body.politica_devolucao,
      cliente: tenantId,
      status: 'pendente'
    }

    const { data, error } = await supabase
      .from('vendedores')
      .insert(vendedorData)
      .select(`
        *,
        aprovado_por:usuarios!vendedores_aprovado_por_fkey(id, nome)
      `)
      .single()

    if (error) {
      logger.error('Erro ao criar vendedor:', error)
      return NextResponse.json({ error: 'Erro ao criar vendedor' }, { status: 500 })
    }

    logger.info('Vendedor criado:', { vendedorId: data.id, nome: data.nome })
    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    logger.error('Erro na criação de vendedor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}