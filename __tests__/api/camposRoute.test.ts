import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/campos/route'
import { NextRequest } from 'next/server'

vi.mock('../../lib/getUserFromHeaders', () => ({
  getUserFromHeaders: vi.fn(() => ({ error: 'Token invalido' }))
}))

describe('GET /api/campos', () => {
  it('retorna 401 quando nao autenticado', async () => {
    const req = new Request('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(401)
  })
})
