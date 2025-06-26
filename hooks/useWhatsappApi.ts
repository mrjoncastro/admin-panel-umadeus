export async function connectInstance(
  instanceName: string,
  apiKey: string,
  tenantId: string,
) {
  const res = await fetch('/api/chats/whatsapp/instance/connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify({ instanceName, apiKey }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt)
  }

  return res.json()
}

export async function fetchConnectionState(
  instanceName: string,
  apiKey: string,
  tenantId: string,
) {
  const res = await fetch('/api/chats/whatsapp/instance/connectionState', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify({ instanceName, apiKey }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt)
  }

  return res.json()
}
