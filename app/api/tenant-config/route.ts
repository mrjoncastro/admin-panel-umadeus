import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { requireRole } from '@/lib/apiAuth'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function GET() {
  const pb = createPocketBase()
  const tenantId = await getTenantFromHost()

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant n\u00e3o informado' }, { status: 400 })
  }

  try {
    const cfg = await pb
      .collection('clientes_config')
      .getFirstListItem(`cliente='${tenantId}'`)

    return NextResponse.json({
      id: cfg.id,
      nome: cfg.nome ?? '',
      cor_primary: cfg.cor_primary ?? '',
      logo_url: cfg.logo_url ?? '',
      font: cfg.font ?? '',
      confirma_inscricoes: cfg.confirmaInscricoes ?? cfg.confirma_inscricoes ?? false,
    })
  } catch (err) {
    await logConciliacaoErro(`Erro ao obter tenant-config: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao obter' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const data = await req.json()
    const cfg = await pb
      .collection('clientes_config')
      .getFirstListItem(`cliente='${user.cliente}'`)
    const updated = await pb.collection('clientes_config').update(cfg.id, {
      cor_primary: data.cor_primary,
      logo_url: data.logo_url,
      font: data.font,
      confirma_inscricoes: data.confirma_inscricoes,
    })
    return NextResponse.json(updated)
  } catch (err) {
    await logConciliacaoErro(`Erro ao atualizar tenant-config: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}
