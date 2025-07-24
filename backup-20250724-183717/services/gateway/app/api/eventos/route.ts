// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextResponse } from 'next/server'
// [REMOVED] PocketBase import
import { EventoRecord, atualizarStatus } from '@/lib/events'
import { logConciliacaoErro } from '@/lib/server/logger'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
export async function GET() {
  // const pb = createPocketBase() // [REMOVED]
  const tenant = await getTenantFromHost()

  if (!tenant) {
    return NextResponse.json(
      { error: 'Domínio não configurado' },
      { status: 404 },
    )
  }
  try {
    const eventos = await // pb. // [REMOVED] collection('eventos').getFullList<EventoRecord>({
      sort: '-data',
      filter: `cliente='${tenant}'`,
      expand: 'produtos,produto_inscricao',
    })
    await atualizarStatus(eventos, pb)
    const comUrls = eventos.map((e) => {
      const fileName = e.imagem || e.logo
      return {
        ...e,
        imagem: fileName ? // pb. // [REMOVED] files.getURL(e, fileName) : undefined,
      }
    })
    return NextResponse.json(comUrls)
  } catch (err) {
    await logConciliacaoErro(`Erro ao listar eventos: ${String(err)}`)
    return NextResponse.json([], { status: 500 })
  }
}
