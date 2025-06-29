import type { NextRequest } from 'next/server'
import type { RecordModel } from 'pocketbase'
import { getUserFromHeaders } from '@/lib/getUserFromHeaders'
import createPocketBase from '@/lib/pocketbase'

export type RequireRoleOk = {
  user: RecordModel
  pb: ReturnType<typeof createPocketBase>
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
