import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/campos/route'
import { NextRequest } from 'next/server'

const getFullListMock = vi.fn().mockResolvedValue([{ id: '1', nome: 'Campo' }])
vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => ({
    collection: () => ({ getFullList: getFullListMock })
  }))
}))

vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: vi.fn().mockResolvedValue(null)
}))

describe('GET /api/campos', () => {
  it('retorna campos sem exigir token', async () => {
    const req = new Request('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual([{ id: '1', nome: 'Campo' }])
  })
})
