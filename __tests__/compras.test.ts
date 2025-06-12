import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
vi.mock('../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { POST } from '../app/admin/api/compras/route'
import { requireRole } from '../lib/apiAuth'

describe('compras POST route', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('permite usuario criar nova compra', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: 'c1' })
    ;(requireRole as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
      pb: { collection: () => ({ create: createMock }) } as any,
      user: { cliente: 'cli1', id: 'user1' }
    })

    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ itens: [] })
    })

    const res = await POST(req as unknown as NextRequest)
    expect(createMock).toHaveBeenCalledWith({ itens: [], cliente: 'cli1', usuario: 'user1' })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.id).toBe('c1')
  })
})
