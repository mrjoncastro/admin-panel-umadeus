import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function POST(req: NextRequest) {
  try {
    const { token, password, passwordConfirm } = await req.json()
    const pb = createPocketBase()
    await pb
      .collection('usuarios')
      .confirmPasswordReset(token, password, passwordConfirm)
    return NextResponse.json({ ok: true })
  } catch (err) {
    await logConciliacaoErro(`Erro ao redefinir senha: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao redefinir' }, { status: 500 })
  }
}
