import { describe, it, expect, vi } from 'vitest'
import { POST } from '../../app/admin/api/asaas/route'
import { NextRequest } from 'next/server'

vi.mock('../../lib/pocketbase', () => ({
  createPocketBase: () => ({
    authStore: { isValid: true },
    admins: { authWithPassword: vi.fn() },
    collection: () => ({ getFirstListItem: vi.fn() })
  })
}))

describe('POST /admin/api/asaas', () => {
  it('lança erro quando ASAAS_API_KEY ausente', async () => {
    delete process.env.ASAAS_API_KEY
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ pedidoId:'1', valor:1 }) })
    await expect(POST(req as unknown as NextRequest)).rejects.toThrow()
  })
})
