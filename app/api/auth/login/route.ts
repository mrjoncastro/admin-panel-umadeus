import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL!)
    await pb.collection('usuarios').authWithPassword(email, password)
    const token = pb.authStore.token
    const user = pb.authStore.model
    const res = NextResponse.json({ user })
    const secure = process.env.NODE_ENV === 'production'
    res.cookies.set('pb_token', token, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json(
      { error: 'Credenciais inválidas' },
      { status: 401 },
    )
  }
}
