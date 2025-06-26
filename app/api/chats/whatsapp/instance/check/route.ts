// ./app/api/chats/whatsapp/instance/check/route.ts

import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { requireRole } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  console.log(`[instance/check] Tenant header:`, tenant)
  if (!tenant) {
    console.log('[instance/check] Sem tenant → retorna null')
    return NextResponse.json(null, { status: 200 })
  }

  // valida role
  const auth = requireRole(req, ['coordenador', 'admin'])
  if ('error' in auth) {
    console.log('[instance/check] Sem permissão → retorna null')
    return NextResponse.json(null, { status: 200 })
  }

  // inicia PB como admin
  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  // busca whatsapp_clientes
  console.log(
    `[instance/check] Buscando whatsapp_clientes para cliente="${tenant}"`,
  )
  const list = await pb
    .collection('whatsapp_clientes')
    .getFullList({ filter: `cliente="${tenant}"`, limit: 1 })

  console.log(`[instance/check] Registros encontrados:`, list.length)
  if (list.length === 0) {
    console.log('[instance/check] Nenhum registro → retorna null')
    return NextResponse.json(null, { status: 200 })
  }

  const rec = list[0]
  console.log(
    `[instance/check] sessionStatus="${rec.sessionStatus}", instanceName="${rec.instanceName}"`,
  )

  return NextResponse.json(
    {
      instanceName: rec.instanceName,
      apiKey: rec.apiKey,
      telefone: rec.telefone,
      sessionStatus: rec.sessionStatus,
    },
    { status: 200 },
  )
}
