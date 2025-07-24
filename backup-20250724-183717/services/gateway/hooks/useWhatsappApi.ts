// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

// [REMOVED] PocketBase import
import { getAuthHeaders } from '@/lib/authHeaders'

export async function connectInstance(
  instanceName: string,
  apiKey: string,
  tenantId: string,
) {
  // const pb = createPocketBase() // [REMOVED]
  const headers = {
    ...getAuthHeaders(pb),
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
  }
  const res = await fetch('/api/chats/whatsapp/instance/connect', {
    method: 'POST',
    headers,
    credentials: 'include',
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
  // const pb = createPocketBase() // [REMOVED]
  const headers = {
    ...getAuthHeaders(pb),
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
  }
  const res = await fetch('/api/chats/whatsapp/instance/connectionState', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ instanceName, apiKey }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt)
  }

  return res.json()
}
