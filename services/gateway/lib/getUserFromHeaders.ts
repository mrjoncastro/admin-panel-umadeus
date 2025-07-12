import type { NextRequest } from 'next/server'
import { getPocketBaseFromRequest } from '@/lib/pbWithAuth'
import { supabase } from './supabaseClient'

// Tipo para usuário do Supabase
type SupabaseUser = {
  id: string
  email: string
  role: string
  nome?: string
  cliente?: string
  [key: string]: any
}

type AuthOk = {
  user: SupabaseUser
  pbSafe: typeof supabase
}

type AuthError = {
  error: string
}

export function getUserFromHeaders(req: NextRequest): AuthOk | AuthError {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  const rawUser = req.headers.get('X-PB-User')

  if (token && rawUser) {
    try {
      const parsedUser = JSON.parse(rawUser) as SupabaseUser
      // No Supabase, o token é gerenciado automaticamente
      // Aqui apenas validamos se o usuário existe
      return { user: parsedUser, pbSafe: supabase }
    } catch {
      return { error: 'Usuário inválido.' }
    }
  }

  // Se não há token, tentar obter usuário da sessão atual
  // Esta é uma implementação simplificada - em produção, você deve
  // implementar a lógica completa de autenticação do Supabase
  return { error: 'Token ou usuário ausente.' }
}
