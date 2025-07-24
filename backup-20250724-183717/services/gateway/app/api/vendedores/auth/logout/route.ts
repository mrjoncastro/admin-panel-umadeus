import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('vendedor-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (token) {
      // Remover sessão do banco
      await supabase
        .from('vendedores_sessoes')
        .delete()
        .eq('token', token)
    }

    const response = NextResponse.json({
      message: 'Logout realizado com sucesso'
    })

    // Remover cookie
    response.cookies.set('vendedor-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    })

    return response

  } catch (error) {
    logger.error('Erro no logout do vendedor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}