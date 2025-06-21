import { NextRequest, NextResponse } from 'next/server'
import { getUserFromHeaders } from '@/lib/getUserFromHeaders'

export async function PATCH(req: NextRequest) {
  const auth = getUserFromHeaders(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  const { pbSafe, user } = auth
  try {
    const {
      data_nascimento,
      cep,
      numero,
      cidade,
      estado,
      endereco,
      campo_id,
      genero,
    } = await req.json()

    const data: Record<string, unknown> = {
      data_nascimento: String(data_nascimento || ''),
      cep: String(cep || ''),
      numero: String(numero || ''),
      cidade: String(cidade || ''),
      estado: String(estado || ''),
      endereco: String(endereco || ''),
      genero: String(genero || ''),
    }
    if (campo_id) data.campo = String(campo_id)

    const updated = await pbSafe.collection('usuarios').update(user.id, data)
    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    console.error('Erro ao atualizar dados:', err)
    return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 })
  }
}
