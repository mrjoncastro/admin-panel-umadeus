import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'

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
    const record = await pb
      .collection('usuarios')
      .getOne(id, { expand: 'campo' })
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
      payload.nome = String(data.nome).trim()
    }
    if (data.telefone !== undefined) {
      payload.telefone = String(data.telefone).replace(/\D/g, '')
    }
    if (data.cpf !== undefined) {
      payload.cpf = String(data.cpf).replace(/\D/g, '')
    }
    if (data.data_nascimento !== undefined) {
      payload.data_nascimento = String(data.data_nascimento)
    }
    if (data.endereco !== undefined) {
      payload.endereco = String(data.endereco).trim()
    }
    if (data.numero !== undefined) {
      payload.numero = String(data.numero).trim()
    }
    if (data.bairro !== undefined) {
      payload.bairro = String(data.bairro).trim()
    }
    if (data.cidade !== undefined) {
      payload.cidade = String(data.cidade).trim()
    }
    if (data.estado !== undefined) {
      payload.estado = String(data.estado).trim()
    }
    if (data.cep !== undefined) {
      payload.cep = String(data.cep).replace(/\D/g, '')
    }
    if (data.tour !== undefined) {
      payload.tour = Boolean(data.tour)
    }

    await pb.collection('usuarios').update(id, payload)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}
