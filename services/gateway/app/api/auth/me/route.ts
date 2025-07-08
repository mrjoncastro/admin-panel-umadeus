import { NextRequest, NextResponse } from 'next/server'
import { getPocketBaseFromRequest } from '@/lib/pbWithAuth'

export async function GET(req: NextRequest) {
  const pb = getPocketBaseFromRequest(req)
  if (!pb.authStore.isValid || !pb.authStore.model) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  return NextResponse.json({ user: pb.authStore.model })
}
