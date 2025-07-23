import { NextRequest, NextResponse } from 'next/server'
import { getUserFromHeaders } from '@/lib/getUserFromHeaders'
import { pbRetry } from '@/lib/pbRetry'

export async function PATCH(req: NextRequest) {
  const auth = getUserFromHeaders(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  const { pbSafe, user } = auth
  try {
    const {
      nome,
      telefone,
      cpf,
      data_nascimento,
      cep,
      numero,
      cidade,
      estado,
      endereco,
      bairro,
      campo_id,
      genero,
    } = await req.json()

    const payload: Record<string, unknown> = {}

    if (nome !== undefined) {
      payload.nome = String(nome).trim()
    }
    if (telefone !== undefined) {
      payload.telefone = String(telefone).replace(/\D/g, '')
    }
    if (cpf !== undefined) {
      payload.cpf = String(cpf).replace(/\D/g, '')
    }
    if (data_nascimento !== undefined) {
      payload.data_nascimento = String(data_nascimento)
    }
    if (cep !== undefined) {
      payload.cep = String(cep)
    }
    if (numero !== undefined) {
      payload.numero = String(numero)
    }
    if (cidade !== undefined) {
      payload.cidade = String(cidade)
    }
    if (estado !== undefined) {
      payload.estado = String(estado)
    }
    if (endereco !== undefined) {
      payload.endereco = String(endereco)
    }
    if (bairro !== undefined) {
      payload.bairro = String(bairro)
    }
    if (genero !== undefined) {
      payload.genero = String(genero)
    }
    if (campo_id !== undefined) {
      payload.campo = String(campo_id)
    }
    const updated = await pbRetry(() =>
      pbSafe.collection('usuarios').update(user.id, payload),
    )
    pbSafe.authStore.save(pbSafe.authStore.token, updated)
    const cookie = pbSafe.authStore.exportToCookie({
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    const res = NextResponse.json(updated, { status: 200 })
    res.headers.append('Set-Cookie', cookie)
    return res
  } catch (err) {
    logger.error('Erro ao atualizar dados:', err)
    return NextResponse.json(
      { error: 'Erro ao atualizar dados' },
      { status: 500 },
    )
  }
}
import { logger } from '@/lib/logger'
