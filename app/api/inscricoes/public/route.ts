import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { logConciliacaoErro } from '@/lib/server/logger'
import { publicLimiter } from '@/lib/server/publicLimiter'
import { ClientResponseError } from 'pocketbase'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'local'
  try {
    publicLimiter.checkNext(req, 5)
  } catch {
    await logConciliacaoErro(
      `GET /inscricoes/public - rate limit exceeded - ${ip}`,
    )
    return NextResponse.json(
      { error: 'Muitas requisições' },
      { status: 429 },
    )
  }

  const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim() || ''
  const cpf = req.nextUrl.searchParams.get('cpf')?.replace(/\D/g, '') || ''
  const eventoId = req.nextUrl.searchParams.get('evento') || ''

  if (!email || !cpf) {
    await logConciliacaoErro(
      `GET /inscricoes/public - parametros ausentes - ${ip}`,
    )
    return NextResponse.json(
      { error: 'cpf e email são obrigatórios' },
      { status: 400 },
    )
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email) || cpf.length !== 11) {
    await logConciliacaoErro(
      `GET /inscricoes/public - parametros invalidos - ${ip}`,
    )
    return NextResponse.json(
      { error: 'Parâmetros inválidos' },
      { status: 400 },
    )
  }

  try {
    const pb = createPocketBase()
    const tenantId = await getTenantFromHost()
    if (!tenantId) {
      await logConciliacaoErro(
        `GET /inscricoes/public - tenant não informado - ${ip}`,
      )
      return NextResponse.json(
        { error: 'Tenant não informado' },
        { status: 400 },
      )
    }

    const filtroParts = [
      `cpf="${cpf}"`,
      `email="${email}"`,
      `cliente="${tenantId}"`,
    ]
    if (eventoId) filtroParts.push(`evento="${eventoId}"`)
    const filtro = filtroParts.join(' && ')

    const record = await pb
      .collection('inscricoes')
      .getFirstListItem(filtro)

    await logConciliacaoErro(
      `GET /inscricoes/public - sucesso - ${ip}`,
    )

    return NextResponse.json(
      {
        nome: record.nome,
        email: record.email,
        cpf: record.cpf,
        status: record.status,
      },
      { status: 200 },
    )
  } catch (err: unknown) {
    if (err instanceof ClientResponseError && err.status === 404) {
      await logConciliacaoErro(
        `GET /inscricoes/public - nao encontrado - ${ip}`,
      )
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 },
      )
    }

    await logConciliacaoErro(
      `GET /inscricoes/public - ${String(err)} - ${ip}`,
    )
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 },
    )
  }
}
