import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { requireRole } from '@/lib/apiAuth'
import createPocketBase from '@/lib/pocketbase'
import { logConciliacaoErro } from '@/lib/server/logger'

export const config = { runtime: 'edge' }

export default async function handler(req: NextRequest) {
  const method = req.method || 'GET'
  if (method === 'GET') {
    const pb = createPocketBase()
    const tenant = await getTenantFromHost()
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant n\u00e3o informado' }, { status: 400 })
    }
    try {
      const sections = await pb.collection('home_sections').getFullList({
        filter: `cliente='${tenant}'`,
        sort: 'ordem',
      })
      return NextResponse.json(sections)
    } catch (err) {
      await logConciliacaoErro(`Erro ao listar home-sections: ${String(err)}`)
      return NextResponse.json({ error: 'Erro ao listar' }, { status: 500 })
    }
  }

  if (method === 'POST') {
    const auth = requireRole(req, 'coordenador')
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { pb, user } = auth
    try {
      const data = await req.json()
      const created = await pb
        .collection('home_sections')
        .create({ ...data, cliente: user.cliente })
      return NextResponse.json(created, { status: 201 })
    } catch (err) {
      await logConciliacaoErro(`Erro ao criar home-section: ${String(err)}`)
      return NextResponse.json({ error: 'Erro ao criar' }, { status: 500 })
    }
  }

  return new NextResponse('Method Not Allowed', { status: 405 })
}
