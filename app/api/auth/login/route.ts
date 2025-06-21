import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL!)
    await pb.collection('usuarios').authWithPassword(email, password)
    const user = pb.authStore.model
    const cookie = pb.authStore.exportToCookie({
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    const res = NextResponse.json({ user })
    res.headers.append('Set-Cookie', cookie)
    return res
  } catch {
    return NextResponse.json(
      { error: 'Credenciais inválidas' },
      { status: 401 },
    )
  }
}
