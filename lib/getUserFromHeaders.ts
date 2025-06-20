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
  const user = pb.authStore.model as RecordModel | null
  if (!pb.authStore.isValid || !user) {
    return { error: 'Token ou usuário ausente.' }
  }
  return { user, pbSafe: pb }
}
