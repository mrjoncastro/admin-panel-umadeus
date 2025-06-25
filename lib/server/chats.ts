import PocketBase from 'pocketbase'

const CHATS_API_URL = process.env.CHATS_API_URL?.replace(/\/$/, '')
const PB_URL = process.env.PB_URL

export async function getClient(instanceName: string) {
  if (!PB_URL) throw new Error('PB_URL not set')
  const pb = new PocketBase(PB_URL)
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }
  try {
    return await pb
      .collection('whatsapp_clientes')
      .getFirstListItem(`instanceName=\"${instanceName}\"`)
  } catch {
    return null
  }
}

export async function saveClient(data: {
  telefone: string
  instanceName: string
  apiKey: string
}) {
  if (!PB_URL) throw new Error('PB_URL not set')
  const pb = new PocketBase(PB_URL)
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }
  const existing = await getClient(data.instanceName)
  if (existing) {
    return pb.collection('whatsapp_clientes').update(existing.id, data)
  }
  return pb.collection('whatsapp_clientes').create(data)
}

export async function generateQr(instanceName: string, apiKey: string) {
  if (!CHATS_API_URL) throw new Error('CHATS_API_URL not set')
  const url = `${CHATS_API_URL}/instances/${instanceName}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
    },
  })
  if (!res.ok) {
    throw new Error('Falha ao gerar QR Code')
  }
  return res.json()
}

export async function sendMessage(params: {
  instanceName: string
  apiKey: string
  to: string
  message: string
  mediaUrl?: string
}) {
  if (!CHATS_API_URL) throw new Error('CHATS_API_URL not set')
  const url = `${CHATS_API_URL}/messages/send`
  const body: Record<string, unknown> = {
    instanceName: params.instanceName,
    to: params.to,
    message: params.message,
  }
  if (params.mediaUrl) body.mediaUrl = params.mediaUrl
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: params.apiKey,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Erro ao enviar mensagem: ${t}`)
  }
  return res.json()
}
