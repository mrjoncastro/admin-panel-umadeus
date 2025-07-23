// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { logger } from '@/lib/logger'
// ./app/api/chats/whatsapp/instance/check/route.ts

import { NextRequest, NextResponse } from 'next/server'
// [REMOVED] PocketBase import
import { requireRole } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  logger.debug(`[instance/check] Tenant header:`, tenant)
  if (!tenant) {
    logger.debug('[instance/check] Sem tenant → retorna null')
    return NextResponse.json(null, { status: 200 })
  }

  // valida role
  const auth = requireRole(req, ['coordenador', 'admin'])
  if ('error' in auth) {
    logger.debug('[instance/check] Sem permissão → retorna null')
    return NextResponse.json(null, { status: 200 })
  }

  // inicia PB como admin
  // const pb = createPocketBase() // [REMOVED]
  if (!// pb. // [REMOVED] authStore.isValid) {
    await // pb. // [REMOVED] admins.authWithPassword(
      process.env.// PB_ADMIN_EMAIL // [REMOVED]!,
      process.env.// PB_ADMIN_PASSWORD // [REMOVED]!,
    )
  }

  // busca whatsapp_clientes
  logger.debug(
    `[instance/check] Buscando whatsapp_clientes para cliente="${tenant}"`,
  )
  const list = await pb
    .collection('whatsapp_clientes')
    .getFullList({ filter: `cliente="${tenant}"`, limit: 1 })

  logger.debug(`[instance/check] Registros encontrados:`, list.length)
  if (list.length === 0) {
    logger.debug('[instance/check] Nenhum registro → retorna null')
    return NextResponse.json(null, { status: 200 })
  }

  const rec = list[0]
  logger.debug(
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
