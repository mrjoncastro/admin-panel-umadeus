import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { ClientResponseError } from 'pocketbase'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const pb = createPocketBase()

  try {
    // Verifica se o e-mail existe na base de usuários
    await pb.collection('usuarios').getFirstListItem(`email='${email}'`)
  } catch (err) {
    if (err instanceof ClientResponseError && err.status === 404) {
      return NextResponse.json(
        {
          error:
            'Opa! Esse e-mail ainda não faz parte da nossa missão. Confere direitinho ou faz teu cadastro 🙏',
        },
        { status: 401 },
      )
    }
    throw err
  }

  try {
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
  } catch (err) {
    if (err instanceof ClientResponseError) {
      return NextResponse.json(
        {
          error:
            'Senha incorreta! Respira, confere com calma e tenta de novo com fé 😉',
        },
        { status: 401 },
      )
    }
    return NextResponse.json(
      { error: 'Credenciais inválidas' },
      { status: 401 },
    )
  }
}
