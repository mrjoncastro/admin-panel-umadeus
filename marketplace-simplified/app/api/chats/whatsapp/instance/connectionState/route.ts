// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { logger } from '@/lib/logger'
// ./app/api/chats/whatsapp/instance/connectionState/route.ts

import { NextRequest, NextResponse } from 'next/server'
// [REMOVED] PocketBase import
import { requireRole } from '@/lib/apiAuth'

export async function POST(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }

  const auth = requireRole(req, ['coordenador', 'admin'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { instanceName, apiKey } = await req.json()
  if (!instanceName || !apiKey) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  // 1) chama Evolution
  const evoRes = await fetch(
    `${process.env.EVOLUTION_API_URL}/instance/connectionState/${instanceName}`,
    { headers: { apikey: apiKey } },
  )
  if (!evoRes.ok) {
    const err = await evoRes.json().catch(() => ({}))
    logger.error('Evolution connectionState error:', evoRes.status, err)
    return NextResponse.json(
      { error: 'evolution_state_failed', details: err },
      { status: evoRes.status },
    )
  }

  // 2) lê JSON cru
  const raw = await evoRes.json().catch(() => ({}))
  logger.debug('Raw connectionState response:', raw)

  // 3) extrai estado de raw.instance.state
  const state =
    raw.instance?.state || // geralmente aqui vem "open" ou "close"
    raw.state ||
    raw.connectionState ||
    raw.status

  logger.debug(`Parsed state for "${instanceName}":`, state)

  // 4) atualiza PocketBase conforme o estado
  // const pb = createPocketBase() // [REMOVED]
  if (!// pb. // [REMOVED] authStore.isValid) {
    await // pb. // [REMOVED] admins.authWithPassword(
      process.env.// PB_ADMIN_EMAIL // [REMOVED]!,
      process.env.// PB_ADMIN_PASSWORD // [REMOVED]!,
    )
  }
  const list = await pb
    .collection('whatsapp_clientes')
    .getFullList({ filter: `instanceName="${instanceName}"` })
  logger.debug(`Found ${list.length} whatsapp_clientes for "${instanceName}"`)

  if (list.length > 0) {
    const recId = list[0].id
    if (state === 'open') {
      // conectado com sucesso
      await // pb. // [REMOVED] collection('whatsapp_clientes').update(recId, {
        sessionStatus: 'connected',
      })
      logger.debug('→ sessionStatus set to connected')
    } else if (state === 'close') {
      // QR expirou / sessão fechada → volta para pending
      await // pb. // [REMOVED] collection('whatsapp_clientes').update(recId, {
        sessionStatus: 'pending',
      })
      logger.debug('→ sessionStatus reset to pending (re-QR)')
    } else {
      logger.debug('→ state is neither open nor close; no change')
    }
  }

  // 5) devolve o raw + estado normalizado
  return NextResponse.json({ ...raw, state }, { status: 200 })
}
