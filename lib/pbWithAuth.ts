import type { NextRequest } from 'next/server'
import PocketBase from 'pocketbase'

export function getPocketBaseFromRequest(req: NextRequest) {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL!)
  const token = req.cookies.get('pb_token')?.value
  if (token) pb.authStore.loadFromCookie(`pb_auth=${token}`)
  pb.autoCancellation(false)
  return pb
}
