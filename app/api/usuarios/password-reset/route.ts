import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    const pb = createPocketBase()
    const origin = req.nextUrl.origin
    const confirmUrl = `${origin}/_/auth/confirm-password-reset`
    await pb.collection('usuarios').requestPasswordReset(String(email), confirmUrl)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro ao solicitar reset:', err)
    return NextResponse.json({ error: 'Erro ao solicitar' }, { status: 500 })
  }
}
