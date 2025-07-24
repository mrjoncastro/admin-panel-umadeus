import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  try {
    // Verifica se o e-mail existe na base de usuários
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('email')
      .eq('email', email)
      .single()

    if (!existingUser) {
      return NextResponse.json(
        {
          error:
            'Opa! Esse e-mail ainda não foi cadastrado. Verifique o email ou faça seu cadastro.',
        },
        { status: 401 },
      )
    }

    // Autenticar com Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        {
          error:
            'Senha incorreta! Respira, confere com calma e tenta de novo com fé 😉',
        },
        { status: 401 },
      )
    }

    const res = NextResponse.json({ 
      user: data.user, 
      session: data.session 
    })
    
    // Set auth cookie
    if (data.session) {
      res.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: data.session.expires_in,
      })
    }
    
    return res
  } catch (err) {
    logger.error('Login error:', err)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}
import { logger } from '@/lib/logger'
