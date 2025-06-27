import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { logConciliacaoErro } from '@/lib/server/logger'
import { fetchUsuario } from '@/lib/services/pocketbase'

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''

  if (!id || id.trim() === '') {
    return NextResponse.json(
      { error: 'ID ausente ou inválido.' },
      { status: 400 },
    )
  }

  const auth = requireRole(req, 'coordenador')

  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { pb, user } = auth

  try {
    const usuario = await fetchUsuario(pb, id, user.cliente as string)
    return NextResponse.json(usuario, { status: 200 })
  } catch (err: unknown) {
    if ((err as Error).message === 'TENANT_MISMATCH') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    if (err instanceof Error) {
      await logConciliacaoErro(`Erro em /api/usuarios/[id]: ${err.message}`)
    } else {
      await logConciliacaoErro('Erro desconhecido em /api/usuarios/[id]')
    }

    return NextResponse.json(
      { error: 'Erro ao carregar usuário.' },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''

  if (!id || id.trim() === '') {
    return NextResponse.json(
      { error: 'ID ausente ou inválido.' },
      { status: 400 },
    )
  }

  const auth = requireRole(req, 'coordenador')

  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { pb, user } = auth

  try {
    await fetchUsuario(pb, id, user.cliente as string)
    const data = await req.json()
    const payload: Record<string, unknown> = {}

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
    if (data.cidade !== undefined) {
      payload.cidade = String(data.cidade).trim()
    }
    if (data.bairro !== undefined) {
      payload.bairro = String(data.bairro).trim()
    }
    if (data.numero !== undefined) {
      payload.numero = String(data.numero).trim()
    }
    if (data.estado !== undefined) {
      payload.estado = String(data.estado).trim()
    }
    if (data.role !== undefined) {
      payload.role = data.role
    }
    if (data.campo !== undefined) {
      payload.campo = data.campo
    }

    const usuario = await pb.collection('usuarios').update(id, payload)
    return NextResponse.json(usuario, { status: 200 })
  } catch (err: unknown) {
    if ((err as Error).message === 'TENANT_MISMATCH') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    if (err instanceof Error) {
      await logConciliacaoErro(`Erro em PATCH /api/usuarios/[id]: ${err.message}`)
    } else {
      await logConciliacaoErro('Erro desconhecido em PATCH /api/usuarios/[id]')
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar usuário.' },
      { status: 500 },
    )
  }
}
