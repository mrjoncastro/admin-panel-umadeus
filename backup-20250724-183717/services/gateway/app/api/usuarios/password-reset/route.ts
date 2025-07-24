// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
// [REMOVED] PocketBase import
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { getTenantHost } from '@/lib/getTenantHost'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    // const pb = createPocketBase() // [REMOVED]

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
    logger.debug('REDIRECT_URL:', redirectUrl)

    await pb
      .collection('usuarios')
      .requestPasswordReset(String(email), redirectUrl)
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('Erro ao solicitar reset:', err)
    return NextResponse.json({ error: 'Erro ao solicitar' }, { status: 500 })
  }
}
import { logger } from '@/lib/logger'
