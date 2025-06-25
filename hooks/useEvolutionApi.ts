const API_URL = (process.env.NEXT_PUBLIC_EVOLUTION_API_URL || process.env.EVOLUTION_API_URL || '').replace(/\/$/, '')

export async function createInstance(telefone: string) {
  const res = await fetch(`${API_URL}/instance/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: process.env.EVOLUTION_API_KEY as string,
    },
    body: JSON.stringify({
      instanceName: telefone.replace(/\D/g, ''),
      number: telefone,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt)
  }

  return res.json()
}

export async function connectInstance(instanceName: string, apiKey: string) {
  const res = await fetch(`${API_URL}/instance/connect/${instanceName}`, {
    headers: { apikey: apiKey },
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt)
  }

  return res.json()
}

export async function fetchInstanceStatus(instanceName: string, apiKey: string) {
  const res = await fetch(`${API_URL}/instance/connectionState/${instanceName}`, {
    headers: { apikey: apiKey },
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt)
  }

  return res.json()
}

export async function sendTestMessage(
  instanceName: string,
  apiKey: string,
  to: string,
  message = 'Olá! QR autenticado com sucesso!'
) {
  const res = await fetch(`${API_URL}/message/sendText/${instanceName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
    },
    body: JSON.stringify({ number: to, text: message }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt)
  }

  return res.json()
}
