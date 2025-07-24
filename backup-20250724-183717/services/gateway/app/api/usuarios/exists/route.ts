// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
// [REMOVED] PocketBase import

export async function GET(req: NextRequest) {
  const pb = createPocketBase(false)
  const cpf = req.nextUrl.searchParams.get('cpf')?.replace(/\D/g, '') || ''
  const email = req.nextUrl.searchParams.get('email') || ''
  const excludeId = req.nextUrl.searchParams.get('excludeId') || ''

  if (!cpf && !email) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const result: { cpf?: boolean; email?: boolean } = {}

  try {
    if (cpf) {
      const filter = `cpf='${cpf}'${excludeId ? ` && id!='${excludeId}'` : ''}`
      const r = await // pb. // [REMOVED] collection('usuarios').getList(1, 1, {
        filter,
      })
      result.cpf = r.items.length > 0
    }
  } catch {
    return NextResponse.json(
      { error: 'Erro ao verificar CPF' },
      { status: 500 },
    )
  }

  try {
    if (email) {
      const filter = `email='${email}'${excludeId ? ` && id!='${excludeId}'` : ''}`
      const r = await // pb. // [REMOVED] collection('usuarios').getList(1, 1, {
        filter,
      })
      result.email = r.items.length > 0
    }
  } catch {
    return NextResponse.json(
      { error: 'Erro ao verificar email' },
      { status: 500 },
    )
  }

  return NextResponse.json(result)
}
