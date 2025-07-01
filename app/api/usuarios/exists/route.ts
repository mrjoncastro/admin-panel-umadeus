import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'

export async function GET(req: NextRequest) {
  const pb = createPocketBase(false)
  const cpf = req.nextUrl.searchParams.get('cpf')?.replace(/\D/g, '') || ''
  const email = req.nextUrl.searchParams.get('email') || ''

  if (!cpf && !email) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const result: { cpf?: boolean; email?: boolean } = {}

  try {
    if (cpf) {
      const r = await pb.collection('usuarios').getList(1, 1, {
        filter: `cpf='${cpf}'`,
      })
      result.cpf = r.items.length > 0
    }
  } catch {
    return NextResponse.json({ error: 'Erro ao verificar CPF' }, { status: 500 })
  }

  try {
    if (email) {
      const r = await pb.collection('usuarios').getList(1, 1, {
        filter: `email='${email}'`,
      })
      result.email = r.items.length > 0
    }
  } catch {
    return NextResponse.json({ error: 'Erro ao verificar email' }, { status: 500 })
  }

  return NextResponse.json(result)
}
