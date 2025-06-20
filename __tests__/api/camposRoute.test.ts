import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/campos/route'
import { NextRequest } from 'next/server'

const getFullListMock = vi.fn().mockResolvedValue([{ id: '1', nome: 'Campo' }])
vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => ({
    collection: () => ({ getFullList: getFullListMock }),
  })),
}))

vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: vi.fn().mockResolvedValue(null),
}))

describe('GET /api/campos', () => {
  it('retorna 404 quando domínio não configurado', async () => {
    const req = new Request('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Domínio não configurado')
  })
})
