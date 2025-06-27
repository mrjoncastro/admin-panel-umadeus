import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const pb = createPocketBase()
    await pb.collection('usuarios').authWithPassword(email, password)
    const user = pb.authStore.model
    const token = pb.authStore.token
    const cookie = pb.authStore.exportToCookie({
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    const res = NextResponse.json({ user, token })
    res.headers.append('Set-Cookie', cookie)
    return res
  } catch {
    return NextResponse.json(
      { error: 'Credenciais inválidas' },
      { status: 401 },
    )
  }
}
