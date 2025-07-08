import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { requireRole } from '@/lib/apiAuth'

export async function DELETE(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }

  const auth = requireRole(req, ['coordenador', 'admin'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  const list = await pb
    .collection('whatsapp_clientes')
    .getFullList({ filter: `cliente="${tenant}"`, limit: 1 })

  if (list.length === 0) {
    return NextResponse.json(
      { error: 'registro_nao_encontrado' },
      { status: 404 },
    )
  }

  const rec = list[0]
  const instanceName = rec.instanceName
  const apiKey = rec.apiKey

  // tenta deslogar e remover na Evolution (ignora erros)
  try {
    await fetch(
      `${process.env.EVOLUTION_API_URL}/instance/logout/${instanceName}`,
      {
        method: 'DELETE',
        headers: { apikey: apiKey },
      },
    )
  } catch {}

  try {
    await fetch(
      `${process.env.EVOLUTION_API_URL}/instance/delete/${instanceName}`,
      {
        method: 'DELETE',
        headers: { apikey: apiKey },
      },
    )
  } catch {}

  await pb.collection('whatsapp_clientes').delete(rec.id)

  return NextResponse.json({ ok: true }, { status: 200 })
}
