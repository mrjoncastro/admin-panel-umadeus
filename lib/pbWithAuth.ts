import type { NextRequest } from 'next/server'
import PocketBase from 'pocketbase'

export function getPocketBaseFromRequest(req: NextRequest) {
  const url = process.env.PB_URL

  if (!url) {
    throw new Error('PB_URL environment variable is not defined')
  }

  const pb = new PocketBase(url)
  const cookieHeader = req.headers.get('cookie') || ''
  pb.authStore.loadFromCookie(cookieHeader)
  pb.autoCancellation(false)
  return pb
}
