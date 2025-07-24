import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { logger } from './logger'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface VendedorTokenPayload {
  vendedor_id: string
  vendedor_auth_id: string
  email: string
  nome: string
  cliente: string
  type: 'vendedor'
  iat?: number
  exp?: number
}

export interface AuthenticatedVendedor {
  id: string
  nome: string
  email: string
  status: string
  cliente: string
  logo_url?: string
  banner_url?: string
  taxa_comissao: number
  total_produtos: number
  total_vendas: number
  avaliacao_media: number
}

export async function verifyVendedorToken(request: NextRequest): Promise<{
  success: boolean
  vendedor?: AuthenticatedVendedor
  error?: string
}> {
  try {
    // Obter token do cookie ou header
    const token = request.cookies.get('vendedor-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return { success: false, error: 'Token não fornecido' }
    }

    // Verificar JWT
    let decoded: VendedorTokenPayload
    try {
      decoded = jwt.verify(token, JWT_SECRET) as VendedorTokenPayload
    } catch (jwtError) {
      return { success: false, error: 'Token inválido' }
    }

    // Verificar se a sessão ainda existe no banco
    const { data: session, error: sessionError } = await supabase
      .from('vendedores_sessoes')
      .select('id, expires_at')
      .eq('token', token)
      .eq('vendedor_id', decoded.vendedor_id)
      .single()

    if (sessionError || !session) {
      return { success: false, error: 'Sessão não encontrada' }
    }

    // Verificar se a sessão não expirou
    if (new Date(session.expires_at) < new Date()) {
      // Remover sessão expirada
      await supabase
        .from('vendedores_sessoes')
        .delete()
        .eq('id', session.id)

      return { success: false, error: 'Sessão expirada' }
    }

    // Buscar dados atualizados do vendedor
    const { data: vendedor, error: vendedorError } = await supabase
      .from('vendedores')
      .select(`
        id,
        nome,
        email,
        status,
        cliente,
        logo_url,
        banner_url,
        taxa_comissao,
        total_produtos,
        total_vendas,
        avaliacao_media
      `)
      .eq('id', decoded.vendedor_id)
      .single()

    if (vendedorError || !vendedor) {
      return { success: false, error: 'Vendedor não encontrado' }
    }

    // Verificar se o vendedor ainda está ativo
    if (vendedor.status !== 'aprovado') {
      return { success: false, error: 'Vendedor não está ativo' }
    }

    return { success: true, vendedor }

  } catch (error) {
    logger.error('Erro na verificação do token do vendedor:', error)
    return { success: false, error: 'Erro interno' }
  }
}

export function requireVendedorAuth(handler: (
  request: NextRequest, 
  vendedor: AuthenticatedVendedor
) => Promise<Response>) {
  return async (request: NextRequest) => {
    const auth = await verifyVendedorToken(request)
    
    if (!auth.success || !auth.vendedor) {
      return new Response(
        JSON.stringify({ error: auth.error || 'Não autorizado' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(request, auth.vendedor)
  }
}

// Utilitário para obter dados do vendedor logado em componentes
export async function getVendedorFromRequest(request: NextRequest): Promise<AuthenticatedVendedor | null> {
  const auth = await verifyVendedorToken(request)
  return auth.success ? auth.vendedor! : null
}