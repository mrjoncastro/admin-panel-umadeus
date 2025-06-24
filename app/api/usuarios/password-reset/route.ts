import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    const pb = createPocketBase()
    await pb.collection('usuarios').requestPasswordReset(String(email))
    return NextResponse.json({ ok: true })
  } catch (err) {
    await logConciliacaoErro(`Erro ao solicitar reset: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao solicitar' }, { status: 500 })
  }
}
