import type { NextRequest } from 'next/server'
import PocketBase from 'pocketbase'

export function getPocketBaseFromRequest(req: NextRequest) {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL!)
  const cookie = req.cookies.get('pb_auth')?.value
  if (cookie) pb.authStore.loadFromCookie(`pb_auth=${cookie}`)
  pb.autoCancellation(false)
  return pb
}
