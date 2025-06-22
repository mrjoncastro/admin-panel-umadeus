import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createCheckout } from '@/lib/asaas'
import { requireClienteFromHost } from '@/lib/clienteAuth'
import { logInfo } from '@/lib/logger'
import { logConciliacaoErro } from '@/lib/server/logger'
import {
  MAX_ITEM_DESCRIPTION_LENGTH,
  MAX_ITEM_NAME_LENGTH,
} from '@/lib/constants'

const checkoutSchema = z.object({
  valorBruto: z.number(),
  paymentMethod: z.enum(['pix', 'boleto', 'credito']),
  itens: z
    .array(
      z.object({
        name: z.string().max(MAX_ITEM_NAME_LENGTH),
        description: z.string().max(MAX_ITEM_DESCRIPTION_LENGTH).optional(),
        quantity: z.number(),
        value: z.number(),
        fotoBase64: z.string().optional().nullable(),
      }),
    )
    .min(1),
  successUrl: z.string().url(),
  errorUrl: z.string().url(),
  clienteId: z.string(),
  usuarioId: z.string(),
  inscricaoId: z.string().optional(),
  cliente: z.object({
    nome: z.string(),
    email: z.string().email(),
    telefone: z.string(),
    cpf: z.string(),
    endereco: z.string(),
    numero: z.string(),
    estado: z.string(),
    cep: z.string(),
    cidade: z.string(),
  }),
  installments: z.number().int().min(1).max(21),
  paymentMethods: z
    .array(z.enum(['PIX', 'CREDIT_CARD']))
    .min(1)
    .max(2)
    .optional(),
})

export async function POST(req: NextRequest) {
  const auth = await requireClienteFromHost(req)

  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { pb, cliente } = auth

  try {
    const body = await req.json()

    const parse = checkoutSchema.safeParse(body)
    if (!parse.success) {
      logInfo(
        '⚠️ Dados inválidos recebidos: ' +
          JSON.stringify(parse.error.flatten()),
      )
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const {
      valorBruto,
      paymentMethod,
      itens,
      successUrl,
      errorUrl,
      clienteId,
      usuarioId,
      inscricaoId,
      cliente: clienteInfo,
      installments,
      paymentMethods,
    } = parse.data

    if (
      process.env.PB_ADMIN_EMAIL &&
      process.env.PB_ADMIN_PASSWORD &&
      !pb.authStore.isValid
    ) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL,
        process.env.PB_ADMIN_PASSWORD,
      )
    }
    const apiKey = cliente.asaas_api_key || process.env.ASAAS_API_KEY || ''
    const userAgent = cliente.nome

    logInfo('🔧 Chamando createCheckout com:', {
      valorBruto,
      paymentMethod,
      itens,
      successUrl,
      errorUrl,
      clienteId,
      usuarioId,
      inscricaoId,
      clienteInfo,
      installments,
      paymentMethods,
    })

    const checkoutUrl = await createCheckout(
      {
        valorBruto,
        paymentMethod,
        itens,
        successUrl,
        errorUrl,
        clienteId,
        usuarioId,
        inscricaoId,
        cliente: clienteInfo,
        installments,
        paymentMethods,
      },
      apiKey,
      userAgent,
    )

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    await logConciliacaoErro(`Erro no checkout: ${String(err)}`)
    return NextResponse.json(
      { error: 'Erro ao processar checkout' },
      { status: 500 },
    )
  }
}
