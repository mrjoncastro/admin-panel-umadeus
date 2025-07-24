import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { requireRole } from '@/lib/apiAuth'
import { broadcastManager } from '@/lib/server/flows/whatsapp'
import { DEFAULT_CONFIG } from '@/lib/server/flows/whatsapp/broadcastQueue'

async function getOrCreateConfig(
  pb: ReturnType<typeof createPocketBase>,
  tenant: string,
) {
  const list = await pb
    .collection('whatsapp_broadcast_config')
    .getFullList({ filter: `cliente="${tenant}"`, limit: 1 })
  if (list.length > 0) return list[0]
  return pb.collection('whatsapp_broadcast_config').create({
    cliente: tenant,
    delayBetweenMessages: DEFAULT_CONFIG.delayBetweenMessages,
    delayBetweenBatches: DEFAULT_CONFIG.delayBetweenBatches,
    batchSize: DEFAULT_CONFIG.batchSize,
    maxMessagesPerMinute: DEFAULT_CONFIG.maxMessagesPerMinute,
    maxMessagesPerHour: DEFAULT_CONFIG.maxMessagesPerHour,
    maxRetries: DEFAULT_CONFIG.maxRetries,
    retryDelay: DEFAULT_CONFIG.retryDelay,
    allowedHoursStart: DEFAULT_CONFIG.allowedHours.start,
    allowedHoursEnd: DEFAULT_CONFIG.allowedHours.end,
    timezone: DEFAULT_CONFIG.timezone,
  })
}

export async function GET(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant)
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })

  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }
  const cfg = await getOrCreateConfig(pb, tenant)
  return NextResponse.json(cfg)
}

async function saveConfig(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant)
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })

  const auth = requireRole(req, ['coordenador', 'admin'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await req.json().catch(() => null)
  if (!body)
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })

  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }
  const existing = await getOrCreateConfig(pb, tenant)

  const payload: Record<string, unknown> = {}
  const simpleFields = [
    'delayBetweenMessages',
    'delayBetweenBatches',
    'batchSize',
    'maxMessagesPerMinute',
    'maxMessagesPerHour',
    'maxRetries',
    'retryDelay',
    'timezone',
  ] as const
  for (const field of simpleFields) {
    if (field in body) payload[field] = body[field]
  }
  if (body.allowedHours?.start !== undefined)
    payload.allowedHoursStart = body.allowedHours.start
  if (body.allowedHours?.end !== undefined)
    payload.allowedHoursEnd = body.allowedHours.end

  const updated = await pb
    .collection('whatsapp_broadcast_config')
    .update(existing.id, payload)

  broadcastManager.updateTenantConfig(tenant, {
    delayBetweenMessages: updated.delayBetweenMessages,
    delayBetweenBatches: updated.delayBetweenBatches,
    batchSize: updated.batchSize,
    maxMessagesPerMinute: updated.maxMessagesPerMinute,
    maxMessagesPerHour: updated.maxMessagesPerHour,
    maxRetries: updated.maxRetries,
    retryDelay: updated.retryDelay,
    allowedHours: {
      start: updated.allowedHoursStart,
      end: updated.allowedHoursEnd,
    },
    timezone: updated.timezone,
  })

  return NextResponse.json(updated)
}

export { saveConfig as PUT, saveConfig as POST }
