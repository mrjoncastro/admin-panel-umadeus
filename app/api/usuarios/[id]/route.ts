import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { pbRetry } from '@/lib/pbRetry'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() || ''
  if (!id) {
    return NextResponse.json({ error: 'ID inv\u00e1lido' }, { status: 400 })
  }
  const auth = requireRole(req, 'usuario')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  if (user.id !== id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  try {
    const record = await pbRetry(() =>
      pb.collection('usuarios').getOne(id, { expand: 'campo' }),
    )
    return NextResponse.json(record, { status: 200 })
  } catch (err) {
    console.error('Erro ao obter usuario:', err)
    return NextResponse.json({ error: 'Erro ao obter' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() || ''
  if (!id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }
  const auth = requireRole(req, 'usuario')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  if (user.id !== id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  try {
    const data = await req.json()
    const payload: Record<string, unknown> = { role: user.role }

    if (data.nome !== undefined) {
      const nome = String(data.nome).trim()
      if (nome) payload.nome = nome
    }
    if (data.telefone !== undefined) {
      const telefone = String(data.telefone).replace(/\D/g, '')
      if (telefone) payload.telefone = telefone
    }
    if (data.cpf !== undefined) {
      const cpf = String(data.cpf).replace(/\D/g, '')
      if (cpf) payload.cpf = cpf
    }
    if (data.data_nascimento !== undefined) {
      const nascimento = String(data.data_nascimento).trim()
      if (nascimento) payload.data_nascimento = nascimento
    }
    if (data.endereco !== undefined) {
      const endereco = String(data.endereco).trim()
      if (endereco) payload.endereco = endereco
    }
    if (data.numero !== undefined) {
      const numero = String(data.numero).trim()
      if (numero) payload.numero = numero
    }
    if (data.bairro !== undefined) {
      const bairro = String(data.bairro).trim()
      if (bairro) payload.bairro = bairro
    }
    if (data.cidade !== undefined) {
      const cidade = String(data.cidade).trim()
      if (cidade) payload.cidade = cidade
    }
    if (data.estado !== undefined) {
      const estado = String(data.estado).trim()
      if (estado) payload.estado = estado
    }
    if (data.cep !== undefined) {
      const cep = String(data.cep).replace(/\D/g, '')
      if (cep) payload.cep = cep
    }
    if (data.tour !== undefined) {
      if (data.tour !== '') payload.tour = Boolean(data.tour)
    }

    const updated = await pbRetry(() =>
      pb.collection('usuarios').update(id, payload),
    )
    pb.authStore.save(pb.authStore.token, updated)
    const cookie = pb.authStore.exportToCookie({
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    const res = NextResponse.json(updated, { status: 200 })
    res.headers.append('Set-Cookie', cookie)
    return res
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}
