import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { logInfo } from '@/lib/logger'
import { logConciliacaoErro } from '@/lib/server/logger'
import { isValidCPF, isValidDate } from '@/utils/validators'

export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')

  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { pb, user } = auth

  try {
    const usuarios = await pb.collection('usuarios').getFullList({
      sort: 'nome',
      expand: 'campo',
      filter: `cliente='${user.cliente}'`,
    })

    logInfo(`📦 ${usuarios.length} usuários encontrados.`)
    return NextResponse.json(usuarios)
  } catch (err: unknown) {
    if (err instanceof Error) {
      await logConciliacaoErro(`Erro em /api/usuarios: ${err.message}`)
    } else {
      await logConciliacaoErro('Erro desconhecido em /api/usuarios.')
    }

    return NextResponse.json(
      { erro: 'Erro ao processar a requisição.' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')

  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { pb, user } = auth

  try {
    const {
      nome,
      email,
      telefone,
      cpf,
      data_nascimento,
      endereco,
      numero,
      estado,
      cep,
      cidade,
      password,
      passwordConfirm,
      role,
      campo,
    } = await req.json()

    if (
      !nome ||
      !email ||
      !telefone ||
      !cpf ||
      !data_nascimento ||
      !endereco ||
      !numero ||
      !estado ||
      !cep ||
      !cidade ||
      !password ||
      !passwordConfirm ||
      !campo ||
      !['usuario', 'lider', 'coordenador'].includes(role)
    ) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const cpfNumerico = String(cpf).replace(/\D/g, '')
    const telefoneNumerico = String(telefone).replace(/\D/g, '')
    const cepNumerico = String(cep).replace(/\D/g, '')

    if (!isValidCPF(cpfNumerico)) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 })
    }

    if (telefoneNumerico.length < 10) {
      return NextResponse.json({ error: 'Telefone inválido' }, { status: 400 })
    }

    if (!isValidDate(String(data_nascimento))) {
      return NextResponse.json(
        { error: 'Data de nascimento inválida' },
        { status: 400 },
      )
    }

    if (cepNumerico.length !== 8) {
      return NextResponse.json({ error: 'CEP inválido' }, { status: 400 })
    }

    const novoUsuario = await pb.collection('usuarios').create({
      nome,
      email,
      telefone: telefoneNumerico,
      cpf: cpfNumerico,
      data_nascimento,
      endereco,
      numero,
      estado,
      cep: cepNumerico,
      cidade,
      password,
      passwordConfirm,
      role,
      campo,
      cliente: user.cliente,
    })

    logInfo('✅ Usuário criado com sucesso')
    return NextResponse.json(novoUsuario, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      await logConciliacaoErro(`Erro em /api/usuarios: ${err.message}`)
    } else {
      await logConciliacaoErro('Erro desconhecido em /api/usuarios.')
    }

    return NextResponse.json(
      { erro: 'Erro ao processar a requisição.' },
      { status: 500 },
    )
  }
}
