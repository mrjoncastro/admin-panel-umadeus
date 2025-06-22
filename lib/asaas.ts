import { MAX_ITEM_DESCRIPTION_LENGTH, MAX_ITEM_NAME_LENGTH } from './constants'
import { calculateGross, PaymentMethod, getAsaasFees } from './asaasFees'
import { toAsaasBilling } from './paymentMethodMap'

export function buildCheckoutUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '') + '/checkouts'
}

export function buildExternalReference(
  clienteId: string,
  usuarioId: string,
  inscricaoId?: string,
): string {
  let ref = `cliente_${clienteId}_usuario_${usuarioId}`
  if (inscricaoId) ref += `_inscricao_${inscricaoId}`
  return ref
}

export type CheckoutItem = {
  name: string
  description?: string
  quantity: number
  value: number
  fotoBase64?: string | null
}

export type CreateCheckoutParams = {
  valorBruto: number
  paymentMethod: PaymentMethod
  installments: number
  itens: CheckoutItem[]
  successUrl: string
  errorUrl: string
  clienteId: string
  usuarioId: string
  inscricaoId?: string
  cliente: {
    nome: string
    email: string
    telefone: string
    cpf: string
    endereco: string
    numero: string
    estado: string
    cep: string
    cidade: string
  }
  paymentMethods?: ('PIX' | 'CREDIT_CARD')[]
}

type AsaasError = {
  errors?: { description?: string }[]
  message?: string
  status?: number
  error?: string // Incluído para casos como { error: "Cliente não encontrado" }
}

async function criarClienteAsaas(
  cliente: CreateCheckoutParams['cliente'],
  apiKey: string,
  agentUser: string,
  baseUrl = process.env.ASAAS_API_URL,
) {
  const url = `${baseUrl?.replace(/\/$/, '')}/customers`
  const payload = {
    name: cliente.nome,
    email: cliente.email,
    phone: cliente.telefone,
    cpfCnpj: cliente.cpf,
    postalCode: cliente.cep,
    address: cliente.endereco,
    addressNumber: cliente.numero,
    province: cliente.estado,
    city: cliente.cidade,
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'access-token': apiKey.startsWith('$') ? apiKey : `$${apiKey}`,
      'User-Agent': agentUser,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(
      (data?.errors?.[0]?.description as string) ||
        (data?.message as string) ||
        'Erro ao criar cliente no Asaas',
    )
  }
  return data
}

export async function createCheckout(
  params: CreateCheckoutParams,
  apiKey: string,
  agentUser: string,
  baseUrl = process.env.ASAAS_API_URL,
): Promise<string> {
  const rawKey = apiKey

  if (!baseUrl || !rawKey) {
    throw new Error('Asaas não configurado')
  }

  const finalKey = rawKey.startsWith('$') ? rawKey : `$${rawKey}`
  const url = buildCheckoutUrl(baseUrl)

  const externalReference = buildExternalReference(
    params.clienteId,
    params.usuarioId,
    params.inscricaoId,
  )
  const parsedValor = Number(String(params.valorBruto).replace(/,/g, '.'))

  if (Number.isNaN(parsedValor)) {
    throw new Error('valorBruto inválido')
  }

  const { gross, margin: initialMargin } = calculateGross(
    parsedValor,
    params.paymentMethod,
    params.installments,
  )
  let margin = Number(initialMargin.toFixed(2))

  // Valor líquido que restará após as taxas do Asaas
  const { fixedFee, percentFee } = getAsaasFees(
    params.paymentMethod,
    params.installments,
  )
  const netAfterFees = Number((gross * (1 - percentFee) - fixedFee).toFixed(2))

  // Evita erro do Asaas quando o split excede o valor da cobrança
  if (margin >= netAfterFees) {
    margin = Number((netAfterFees - 0.01).toFixed(2))
  }

  const isInstallmentCredit =
    params.paymentMethod === 'credito' && params.installments > 1

  function buildPayload(splitMargin: number) {
    return {
      billingTypes: params.paymentMethods ?? [
        toAsaasBilling(params.paymentMethod),
      ],
      chargeTypes: isInstallmentCredit
        ? ['DETACHED', 'INSTALLMENT']
        : ['DETACHED'],
      callback: {
        successUrl: params.successUrl,
        cancelUrl: params.errorUrl,
        expiredUrl: params.errorUrl,
      },
      minutesToExpire: 15,
      value: gross,
      items: params.itens.map((i) => ({
        description: (i.description ?? i.name).slice(
          0,
          MAX_ITEM_DESCRIPTION_LENGTH,
        ),
        name: i.name.slice(0, MAX_ITEM_NAME_LENGTH),
        quantity: i.quantity,
        value: i.value,
      })),
      customerData: {
        name: params.cliente.nome,
        email: params.cliente.email,
        phone: params.cliente.telefone,
        address: params.cliente.endereco,
        addressNumber: Number(params.cliente.numero),
        province: params.cliente.estado,
        postalCode: params.cliente.cep,
        city: params.cliente.cidade,
        cpfCnpj: params.cliente.cpf,
      },
      ...(isInstallmentCredit
        ? { installment: { maxInstallmentCount: params.installments } }
        : {}),
      customFields:
        (params.itens
          .map((item, idx) =>
            item.fotoBase64
              ? { name: `item${idx + 1}Foto`, value: item.fotoBase64 }
              : null,
          )
          .filter(Boolean) as { name: string; value: string }[]) || undefined,
      split: [
        {
          walletId: process.env.WALLETID_M24,
          fixedValue: splitMargin,
        },
      ],
      externalReference,
    }
  }

  async function sendCheckout(
    payload: unknown,
  ): Promise<{ ok: boolean; text: string }> {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'access-token': finalKey,
        'User-Agent': agentUser,
      },
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    return { ok: res.ok, text }
  }

  let payload = buildPayload(margin)
  let { ok, text } = await sendCheckout(payload)

  // Tenta criar cliente se necessário
  try {
    const parsed: AsaasError = JSON.parse(text)
    if (parsed && typeof parsed === 'object' && 'error' in parsed) {
      if (
        typeof parsed.error === 'string' &&
        parsed.error.toLowerCase().includes('cliente não encontrado')
      ) {
        await criarClienteAsaas(params.cliente, apiKey, agentUser, baseUrl)
        // Reenvia o checkout agora com cliente criado
        const result = await sendCheckout(payload)
        ok = result.ok
        text = result.text
      }
    }
  } catch {
    // ignora se não for JSON
  }

  // Tratamento para split excedido (retry)
  if (!ok) {
    try {
      const err = JSON.parse(text) as AsaasError
      const desc = err.errors?.[0]?.description ?? ''
      const match = desc.match(/R\$\s*([0-9.,]+)/g)
      if (match && match.length >= 2) {
        const allowed = Number(
          match[1].replace(/[^0-9,]/g, '').replace(/,/, '.'),
        )
        if (!Number.isNaN(allowed)) {
          const newSplit = Number((allowed - 0.01).toFixed(2))
          payload = buildPayload(newSplit)
          const retry = await sendCheckout(payload)
          ok = retry.ok
          text = retry.text
        }
      }
    } catch {
      // ignore
    }
  }

  if (!ok) {
    try {
      const errObj: AsaasError = JSON.parse(text)
      throw errObj
    } catch {
      throw new Error(text)
    }
  }

  const data = JSON.parse(text)
  const checkoutUrl: string | undefined =
    data?.invoiceUrl || data?.checkoutUrl || data?.link

  if (!checkoutUrl) {
    throw new Error('checkoutUrl ausente')
  }

  return checkoutUrl
}
