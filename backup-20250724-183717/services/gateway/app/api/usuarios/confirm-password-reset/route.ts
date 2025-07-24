// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
// [REMOVED] PocketBase import

export async function POST(req: NextRequest) {
  try {
    const { token, password, passwordConfirm } = await req.json()
    // const pb = createPocketBase() // [REMOVED]
    await pb
      .collection('usuarios')
      .confirmPasswordReset(token, password, passwordConfirm)
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('Erro ao redefinir senha:', err)
    return NextResponse.json({ error: 'Erro ao redefinir' }, { status: 500 })
  }
}
import { logger } from '@/lib/logger'
