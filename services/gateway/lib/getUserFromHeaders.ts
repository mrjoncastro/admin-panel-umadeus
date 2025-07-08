import type { NextRequest } from 'next/server'
import { getPocketBaseFromRequest } from '@/lib/pbWithAuth'
import PocketBase, { RecordModel } from 'pocketbase'

type AuthOk = {
  user: RecordModel
  pbSafe: PocketBase
}

type AuthError = {
  error: string
}

export function getUserFromHeaders(req: NextRequest): AuthOk | AuthError {
  const pb = getPocketBaseFromRequest(req)

  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  const rawUser = req.headers.get('X-PB-User')

  if (token && rawUser) {
    try {
      const parsedUser = JSON.parse(rawUser) as RecordModel
      pb.authStore.save(token, parsedUser)
    } catch {
      return { error: 'Usuário inválido.' }
    }
  }

  const user = pb.authStore.model as RecordModel | null
  if (!pb.authStore.isValid || !user) {
    return { error: 'Token ou usuário ausente.' }
  }
  return { user, pbSafe: pb }
}
