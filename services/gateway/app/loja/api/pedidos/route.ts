import { NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const pb = createPocketBase()
  pb.authStore.loadFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json([], { status: 401 })
  }

  const tenant = await getTenantFromHost()
  const { items } = await pb
    .collection('pedidos')
    .getList(1, 10, { filter: `cliente="${tenant}"`, sort: '-created' })

  return NextResponse.json(items)
}
