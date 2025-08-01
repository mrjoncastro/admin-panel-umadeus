import { describe, it, expect, vi, afterEach } from 'vitest'
import { POST } from '../../app/api/asaas/checkout/route'
import { NextRequest } from 'next/server'
vi.mock('../../lib/clienteAuth', () => ({ requireClienteFromHost: vi.fn() }))
import { requireClienteFromHost } from '../../lib/clienteAuth'

describe('POST /admin/api/asaas/checkout', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna 403 quando autenticação falha', async () => {
    ;(
      requireClienteFromHost as unknown as { mockReturnValue: (v: any) => void }
    ).mockResolvedValue({
      error: 'Acesso negado',
      status: 403,
    })
    const req = new Request('http://test', { method: 'POST', body: '{}' })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(403)
  })
})
