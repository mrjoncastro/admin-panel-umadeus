import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { ClientResponseError } from 'pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { logConciliacaoErro } from '@/lib/server/logger'
import type { PaymentMethod } from '@/lib/asaasFees'
import { criarInscricao, InscricaoTemplate } from '@/lib/templates/inscricao'

export async function POST(req: NextRequest) {
  const pb = createPocketBase()
  pb.authStore.loadFromCookie(req.headers.get('cookie') || '')
  const tenantId = await getTenantFromHost()

  try {
    const data = await req.json()

    const nome = `${data.user_first_name || ''} ${
      data.user_last_name || ''
    }`.trim()
    const senha = data.password || data.passwordConfirm

    let usuario
    if (pb.authStore.isValid && pb.authStore.model) {
      usuario = pb.authStore.model
    } else {
      try {
        usuario = await pb
          .collection('usuarios')
          .getFirstListItem(`email='${data.user_email}'`)
      } catch {
        if (!tenantId) {
          return NextResponse.json(
            { error: 'Tenant não informado' },
            { status: 400 },
          )
        }
        const tempPass = Math.random().toString(36).slice(2, 10)
        usuario = await pb.collection('usuarios').create({
          nome,
          email: data.user_email,
          cpf: String(data.user_cpf).replace(/\D/g, ''),
          telefone: String(data.user_phone).replace(/\D/g, ''),
          data_nascimento: data.user_birth_date,
          genero: data.user_gender?.toLowerCase(),
          endereco: data.user_address,
          bairro: data.user_neighborhood,
          cep: data.user_cep,
          cidade: data.user_city,
          estado: data.user_state,
          numero: data.user_number,
          cliente: tenantId,
          campo: data.campo,
          perfil: 'usuario',
          role: 'usuario',
          password: senha || tempPass,
          passwordConfirm: senha || tempPass,
        })
      }
    }

    const base: InscricaoTemplate = {
      nome,
      email: data.user_email,
      telefone: String(data.user_phone).replace(/\D/g, ''),
      cpf: String(data.user_cpf).replace(/\D/g, ''),
      data_nascimento: data.user_birth_date,
      genero: data.user_gender.toLowerCase(),
      campo: data.campo,
      evento: data.evento,
      criado_por: usuario.id,
      produto: data.produtoId,
      tamanho: data.tamanho,
      ...(tenantId ? { cliente: tenantId } : {}),
    }

    const paymentMethod: PaymentMethod = ['pix', 'boleto', 'credito'].includes(
      data.paymentMethod,
    )
      ? data.paymentMethod
      : 'pix'
    const installments = Number(data.installments) || 1

    const { id: _inscricaoId, ...inscricaoSemId } = criarInscricao(base)
    void _inscricaoId

    const registroParaCriar = {
      ...inscricaoSemId,
      paymentMethod,
      installments,
    }

    const record = await pb.collection('inscricoes').create(registroParaCriar)

    return NextResponse.json(record, { status: 201 })
  } catch (err: unknown) {
