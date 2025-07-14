import type { NextRequest } from 'next/server'
import { getUserFromHeaders } from '@/lib/getUserFromHeaders'
import { supabase } from './supabaseClient'

// Tipo para usuário do Supabase
type SupabaseUser = {
  id: string
  email: string
  role: string
  nome?: string
  cliente?: string
  [key: string]: unknown
}

export type RequireRoleOk = {
  user: SupabaseUser
  pb: typeof supabase
}

export type RequireRoleError = {
  error: string
  status: number
}

export function requireRole(
  req: NextRequest,
  roles: string | string[],
): RequireRoleOk | RequireRoleError {
  const result = getUserFromHeaders(req)

  if ('error' in result) {
    return { error: result.error, status: 401 }
  }

  const { user, pbSafe } = result

  const allowed = Array.isArray(roles) ? roles : [roles]

  if (!allowed.includes(user.role)) {
    return { error: 'Acesso negado', status: 403 }
  }

  return { user, pb: pbSafe }
}
