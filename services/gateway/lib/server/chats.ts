// ./lib/server/chats.ts

import PocketBase from 'pocketbase'
import { pbRetry } from '@/lib/pbRetry'
import { broadcastManager } from '@/lib/server/flows/whatsapp'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL?.replace(/\/$/, '')
const PB_URL = process.env.PB_URL!

/** Retorna um cliente admin autenticado do PocketBase */
async function getAdminClient() {
  const pb = new PocketBase(PB_URL)
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }
  return pb
}

/** Busca um registro em whatsapp_clientes pelo instanceName */
export async function getClient(instanceName: string) {
  const pb = await getAdminClient()
  try {
    return await pbRetry(() =>
      pb
        .collection('whatsapp_clientes')
        .getFirstListItem(`instanceName="${instanceName}"`),
    )
  } catch {
    return null
  }
}

/** Cria ou atualiza um registro em whatsapp_clientes */
export async function saveClient(data: {
  telefone: string
  instanceName: string
  apiKey: string
}) {
  const pb = await getAdminClient()
  const existing = await getClient(data.instanceName)

  const record = {
    telefone: data.telefone,
    instanceName: data.instanceName,
    apiKey: data.apiKey,
    sessionStatus: 'pending',
  }

  if (existing) {
    return pbRetry(() =>
      pb.collection('whatsapp_clientes').update(existing.id, record),
    )
  } else {
    return pbRetry(() => pb.collection('whatsapp_clientes').create(record))
  }
}

/** Gera o QR Code chamando o endpoint de connect da Evolution API */
export async function generateQr(instanceName: string, apiKey: string) {
  if (!EVOLUTION_API_URL) throw new Error('EVOLUTION_API_URL not set')

  const res = await fetch(
    `${EVOLUTION_API_URL}/instance/connect/${instanceName}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
    },
  )
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Falha ao gerar QR Code: ${txt}`)
  }
  return res.json()
}

/** Envia mensagem de texto via Evolution `/message/sendText/{instance}` */
export async function sendTextMessage(params: {
  instanceName: string
  apiKey: string
  to: string
  message: string
}) {
  if (!EVOLUTION_API_URL) throw new Error('EVOLUTION_API_URL not set')

  const url = `${EVOLUTION_API_URL}/message/sendText/${params.instanceName}`

  const digits = params.to.replace(/\D/g, '')
  const phone = digits.startsWith('55') ? digits : `55${digits}`

  const body = { number: phone, text: params.message }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: params.apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Erro ao enviar texto: ${txt}`)
  }

  return res.json()
}

/** Envia mensagem — agora delega para sendTextMessage */
export async function sendMessage(params: {
  instanceName: string
  apiKey: string
  to: string
  message: string
  mediaUrl?: string
}) {
  // Se houver mediaUrl, você pode chamar outro endpoint ou
  // adaptá-lo conforme necessidade. Por agora, apenas texto:
  return sendTextMessage({
    instanceName: params.instanceName,
    apiKey: params.apiKey,
    to: params.to,
    message: params.message,
  })
}

/** Enfileira o envio respeitando limites e horários */
export async function queueTextMessage(
  params: {
    tenant: string
    instanceName: string
    apiKey: string
    to: string
    message: string
  },
  awaitSend = true,
) {
  const promise = broadcastManager.enqueue(params.tenant, () =>
    sendTextMessage({
      instanceName: params.instanceName,
      apiKey: params.apiKey,
      to: params.to,
      message: params.message,
    }),
  )

  if (awaitSend) {
    return promise
  }

  promise.catch((err) =>
    console.error('Erro ao enviar mensagem em background:', err),
  )
}
