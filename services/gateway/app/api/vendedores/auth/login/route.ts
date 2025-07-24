import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const MAX_LOGIN_ATTEMPTS = 5
const BLOCK_DURATION = 30 * 60 * 1000 // 30 minutos

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar vendedor e dados de autenticação
    const { data: vendedorAuth, error: authError } = await supabase
      .from('vendedores_auth')
      .select(`
        *,
        vendedor:vendedores!vendedores_auth_vendedor_id_fkey(
          id,
          nome,
          email,
          status,
          cliente,
          logo_url,
          banner_url
        )
      `)
      .eq('email', email.toLowerCase())
      .eq('ativo', true)
      .single()

    if (authError || !vendedorAuth) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verificar se a conta está bloqueada
    if (vendedorAuth.blocked_until && new Date(vendedorAuth.blocked_until) > new Date()) {
      const blockedUntil = new Date(vendedorAuth.blocked_until).toLocaleString('pt-BR')
      return NextResponse.json(
        { error: `Conta bloqueada até ${blockedUntil}` },
        { status: 423 }
      )
    }

    // Verificar se o vendedor está aprovado
    if (vendedorAuth.vendedor.status !== 'aprovado') {
      let message = 'Vendedor não está ativo'
      switch (vendedorAuth.vendedor.status) {
        case 'pendente':
          message = 'Sua conta está aguardando aprovação'
          break
        case 'rejeitado':
          message = 'Sua conta foi rejeitada. Entre em contato com o suporte'
          break
        case 'suspenso':
          message = 'Sua conta está suspensa. Entre em contato com o suporte'
          break
      }
      return NextResponse.json({ error: message }, { status: 403 })
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, vendedorAuth.password_hash)

    if (!passwordMatch) {
      // Incrementar tentativas de login
      const newAttempts = vendedorAuth.login_attempts + 1
      const shouldBlock = newAttempts >= MAX_LOGIN_ATTEMPTS

      await supabase
        .from('vendedores_auth')
        .update({
          login_attempts: newAttempts,
          blocked_until: shouldBlock 
            ? new Date(Date.now() + BLOCK_DURATION).toISOString()
            : null,
          updated: new Date().toISOString()
        })
        .eq('id', vendedorAuth.id)

      if (shouldBlock) {
        return NextResponse.json(
          { error: 'Muitas tentativas de login. Conta bloqueada por 30 minutos' },
          { status: 423 }
        )
      }

      return NextResponse.json(
        { 
          error: 'Email ou senha incorretos',
          attempts_remaining: MAX_LOGIN_ATTEMPTS - newAttempts
        },
        { status: 401 }
      )
    }

    // Login bem-sucedido - resetar tentativas e atualizar último login
    await supabase
      .from('vendedores_auth')
      .update({
        login_attempts: 0,
        blocked_until: null,
        last_login: new Date().toISOString(),
        updated: new Date().toISOString()
      })
      .eq('id', vendedorAuth.id)

    // Gerar token JWT
    const tokenPayload = {
      vendedor_id: vendedorAuth.vendedor.id,
      vendedor_auth_id: vendedorAuth.id,
      email: vendedorAuth.email,
      nome: vendedorAuth.vendedor.nome,
      cliente: vendedorAuth.vendedor.cliente,
      type: 'vendedor'
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' })

    // Criar sessão
    const sessionData = {
      vendedor_id: vendedorAuth.vendedor.id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      user_agent: request.headers.get('user-agent') || '',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    }

    const { error: sessionError } = await supabase
      .from('vendedores_sessoes')
      .insert(sessionData)

    if (sessionError) {
      logger.error('Erro ao criar sessão do vendedor:', sessionError)
      // Não bloquear o login por erro de sessão
    }

    // Log do login
    logger.info('Vendedor logado:', {
      vendedor_id: vendedorAuth.vendedor.id,
      email: vendedorAuth.email,
      nome: vendedorAuth.vendedor.nome,
      cliente: vendedorAuth.vendedor.cliente
    })

    // Preparar resposta
    const response = NextResponse.json({
      message: 'Login realizado com sucesso',
      vendedor: {
        id: vendedorAuth.vendedor.id,
        nome: vendedorAuth.vendedor.nome,
        email: vendedorAuth.vendedor.email,
        status: vendedorAuth.vendedor.status,
        cliente: vendedorAuth.vendedor.cliente,
        logo_url: vendedorAuth.vendedor.logo_url,
        banner_url: vendedorAuth.vendedor.banner_url
      },
      token
    })

    // Configurar cookie seguro
    response.cookies.set('vendedor-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 dias em segundos
    })

    return response

  } catch (error) {
    logger.error('Erro no login do vendedor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}