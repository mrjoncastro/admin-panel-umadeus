import type { NextRequest } from 'next/server'
import PocketBase from 'pocketbase'

const DEFAULT_PB_URL = 'http://127.0.0.1:8090'

export function getPocketBaseFromRequest(req: NextRequest) {
  const url = process.env.PB_URL || DEFAULT_PB_URL

  if (!process.env.PB_URL) {
    console.warn(
      `PB_URL não configurada. Usando valor padrão: ${DEFAULT_PB_URL}`,
    )
  }

  const pb = new PocketBase(url)
  const cookieHeader = req.headers.get('cookie') || ''
  pb.authStore.loadFromCookie(cookieHeader)
  pb.autoCancellation(false)
  return pb
}
