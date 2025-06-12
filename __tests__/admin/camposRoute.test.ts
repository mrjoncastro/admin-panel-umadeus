import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/admin/api/campos/route'
import { NextRequest } from 'next/server'

vi.mock('../../lib/apiAuth', () => ({
  requireRole: vi.fn(() => ({ error: 'Acesso negado', status: 403 }))
}))

describe('GET /admin/api/campos', () => {
  it('retorna codigo da autenticacao quando requireRole falha', async () => {
    const req = new Request('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(403)
  })
})
