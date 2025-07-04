import { NextRequest, NextResponse } from 'next/server'
import { requireClienteFromHost } from '@/lib/clienteAuth'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function GET(req: NextRequest) {
  const auth = await requireClienteFromHost(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { cliente } = auth
  const baseUrl = process.env.ASAAS_API_URL
  const apiKey = cliente.asaas_api_key || process.env.ASAAS_API_KEY || ''
  const userAgent = cliente.nome || 'qg3'

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: 'Asaas não configurado' },
      { status: 500 },
    )
  }

  const start = req.nextUrl.searchParams.get('start')
  const end = req.nextUrl.searchParams.get('end')

  const keyHeader = apiKey.startsWith('$') ? apiKey : `$${apiKey}`
  const url = new URL(`${baseUrl}/financialTransactions`)
  url.searchParams.set('offset', '0')
  url.searchParams.set('limit', '50')
  if (start) url.searchParams.set('startDate', start)
  if (end) url.searchParams.set('finishDate', end)
  url.searchParams.set('order', 'desc')

  try {
    const res = await fetch(url.toString(), {
      headers: {
        accept: 'application/json',
        'access-token': keyHeader,
        'User-Agent': userAgent,
      },
    })

    if (!res.ok) {
      const errorBody = await res.text()
      await logConciliacaoErro(`Erro ao consultar extrato: ${errorBody}`)
      return NextResponse.json(
        { error: 'Falha ao consultar extrato' },
        { status: 500 },
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    await logConciliacaoErro(
      `Erro inesperado ao consultar extrato: ${String(err)}`,
    )
    return NextResponse.json(
      { error: 'Erro ao consultar extrato' },
      { status: 500 },
    )
  }
}
