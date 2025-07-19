import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { ClientResponseError } from 'pocketbase'

export async function GET(req: NextRequest) {
  const cpf = req.nextUrl.searchParams.get('cpf')?.replace(/\D/g, '') || ''
  if (cpf.length !== 11) {
    return NextResponse.json({ error: 'CPF inválido' }, { status: 400 })
  }

  const pb = createPocketBase(false)
  try {
    const usuario = await pb
      .collection('usuarios')
      .getFirstListItem(`cpf='${cpf}'`)
    return NextResponse.json({
      id: usuario.id,
      nome: usuario.nome,
      telefone: usuario.telefone,
      email: usuario.email,
      genero: usuario.genero,
    })
  } catch (err: unknown) {
    if (err instanceof ClientResponseError && err.status === 404) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 },
      )
    }
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 },
    )
  }
}
