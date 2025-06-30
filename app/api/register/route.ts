import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { logInfo } from '@/lib/logger'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function POST(req: NextRequest) {
  const pb = createPocketBase()
  try {
    const {
      nome,
      email,
      telefone,
      cpf,
      data_nascimento,
      endereco,
      numero,
      bairro,
      estado,
      cep,
      cidade,
      password,
      campo,
      cliente,
    } = await req.json()
    const missing: Record<string, string> = {}
    if (!nome) missing.nome = 'O nome é obrigatório'
    if (!email) missing.email = 'O e-mail é obrigatório'
    if (!telefone) missing.telefone = 'O telefone é obrigatório'
    if (!cpf) missing.cpf = 'O CPF é obrigatório'
    if (!data_nascimento) missing.data_nascimento = 'A data de nascimento é obrigatória'
    if (!campo) missing.campo = 'O campo é obrigatório'
    if (!endereco) missing.endereco = 'O endereço é obrigatório'
    if (!numero) missing.numero = 'O número é obrigatório'
    if (!bairro) missing.bairro = 'O bairro é obrigatório'
    if (!estado) missing.estado = 'O estado é obrigatório'
    if (!cep) missing.cep = 'O CEP é obrigatório'
    if (!cidade) missing.cidade = 'A cidade é obrigatória'
    if (!password) missing.password = 'A senha é obrigatória'
    if (!cliente) missing.cliente = 'Cliente não informado'
    if (Object.keys(missing).length > 0) {
      return NextResponse.json(
        { error: 'validation_failed', fields: missing },
        { status: 422 },
      )
    }
    try {
      await pb
        .collection('clientes_config')
        .getFirstListItem(`cliente='${String(cliente)}'`)
    } catch {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 },
      )
    }
    const novoUsuario = await pb.collection('usuarios').create({
      nome: String(nome).trim(),
      email: String(email).trim(),
      emailVisibility: true,
      cliente: String(cliente),
      telefone: String(telefone).trim(),
      cpf: String(cpf).trim(),
      campo: String(campo),
      data_nascimento: String(data_nascimento),
      endereco: String(endereco).trim(),
      numero: String(numero).trim(),
      bairro: String(bairro).trim(),
      estado: String(estado).trim(),
      cep: String(cep).trim(),
      cidade: String(cidade).trim(),
      password: String(password),
      passwordConfirm: String(password),
      role: 'usuario',
    })
    logInfo('\u2705 Usu\u00E1rio registrado com sucesso')
    return NextResponse.json(novoUsuario, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      await logConciliacaoErro(`Erro em /api/register: ${err.message}`)
    } else {
      await logConciliacaoErro('Erro desconhecido em /api/register.')
    }
    return NextResponse.json(
      { erro: 'Erro ao processar a requisi\u00E7\u00E3o.' },
      { status: 500 },
    )
  }
}
