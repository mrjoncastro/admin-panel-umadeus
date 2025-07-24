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
  const userAgent = cliente.nome || 'M24'

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: 'Asaas não configurado' },
      { status: 500 },
    )
  }

  const keyHeader = apiKey.startsWith('$') ? apiKey : `$${apiKey}`
  const url = new URL(`${baseUrl}/finance/payment/statistics`)
  req.nextUrl.searchParams.forEach((value, name) => {
    url.searchParams.set(name, value)
  })

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
      await logConciliacaoErro(`Erro ao consultar estatísticas: ${errorBody}`)
      return NextResponse.json(
        { error: 'Falha ao consultar estatísticas' },
        { status: 500 },
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    await logConciliacaoErro(
      `Erro inesperado ao consultar estatísticas: ${String(err)}`,
    )
    return NextResponse.json(
      { error: 'Erro ao consultar estatísticas' },
      { status: 500 },
    )
  }
}
