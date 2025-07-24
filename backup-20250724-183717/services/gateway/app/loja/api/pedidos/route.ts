// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextResponse } from 'next/server'
// [REMOVED] PocketBase import
import { getTenantFromHost } from '@/lib/getTenantFromHost'

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  // const pb = createPocketBase() // [REMOVED]
  // pb. // [REMOVED] authStore.loadFromCookie(cookie)

  if (!// pb. // [REMOVED] authStore.isValid) {
    return NextResponse.json([], { status: 401 })
  }

  const tenant = await getTenantFromHost()
  const { items } = await pb
    .collection('pedidos')
    .getList(1, 10, { filter: `cliente="${tenant}"`, sort: '-created' })

  return NextResponse.json(items)
}
