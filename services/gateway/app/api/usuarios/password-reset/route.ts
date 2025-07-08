import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { getTenantHost } from '@/lib/getTenantHost'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    const pb = createPocketBase()

    const tenantId = await getTenantFromHost()
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant não encontrado' },
        { status: 400 },
      )
    }

    const host = await getTenantHost(tenantId)
    if (!host) {
      return NextResponse.json(
        { error: 'Host não configurado' },
        { status: 500 },
      )
    }

    const redirectUrl = `${host}/auth/confirm-password-reset`
    console.log('REDIRECT_URL:', redirectUrl)

    await pb
      .collection('usuarios')
      .requestPasswordReset(String(email), redirectUrl)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro ao solicitar reset:', err)
    return NextResponse.json({ error: 'Erro ao solicitar' }, { status: 500 })
  }
}
