import { describe, it, expect, vi, afterEach } from 'vitest'
import { POST } from '../../app/admin/api/asaas/route'
import { NextRequest } from 'next/server'
vi.mock('../../lib/apiAuth', () => ({ requireRole: vi.fn() }))
vi.mock('../../lib/pocketbase', () => ({
  createPocketBase: () => ({
    authStore: { isValid: true },
    admins: { authWithPassword: vi.fn() },
    collection: () => ({ getFirstListItem: vi.fn() })
  })
}))
import { requireRole } from '../../lib/apiAuth'

describe('POST /admin/api/asaas', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna 403 quando requireRole falha', async () => {
    (requireRole as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
      error: 'Acesso negado',
      status: 403
    })
    const req = new Request('http://test', { method: 'POST', body: '{}' })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(403)
  })

  it('lança erro quando ASAAS_API_KEY ausente', async () => {
    (requireRole as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
      pb: {
        authStore: { isValid: true },
        admins: { authWithPassword: vi.fn() },
        collection: () => ({ getFirstListItem: vi.fn() })
      } as any,
      user: { role: 'coordenador' }
    })
    delete process.env.ASAAS_API_KEY
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ pedidoId:'1', valorLiquido:1, paymentMethod:'pix', installments:1 }) })
    await expect(POST(req as unknown as NextRequest)).rejects.toThrow()
  })
})
