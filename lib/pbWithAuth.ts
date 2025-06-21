import type { NextRequest } from 'next/server'
import PocketBase from 'pocketbase'

export function getPocketBaseFromRequest(req: NextRequest) {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL!)
  const cookieHeader = req.headers.get('cookie') || ''
  pb.authStore.loadFromCookie(cookieHeader)
  pb.autoCancellation(false)
  return pb
}
