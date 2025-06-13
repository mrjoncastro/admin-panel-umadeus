import { describe, it, expect, vi, afterEach } from 'vitest'
import { POST } from '../../app/admin/api/asaas/checkout/route'
import { NextRequest } from 'next/server'
vi.mock('../../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { requireRole } from '../../lib/apiAuth'

describe('POST /admin/api/asaas/checkout', () => {
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
})
