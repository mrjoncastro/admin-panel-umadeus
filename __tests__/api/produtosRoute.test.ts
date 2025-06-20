import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/produtos/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const pb = createPocketBaseMock()
pb.collection.mockReturnValue({
  getFullList: vi.fn().mockRejectedValue(new Error('fail')),
})
vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => pb),
}))

vi.mock('../../lib/products', () => ({
  filtrarProdutos: vi.fn((p) => p),
}))
let getTenantFromHostMock: any
vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: (...args: any[]) => getTenantFromHostMock(...args),
}))
getTenantFromHostMock = vi.fn()

beforeEach(() => {
  getTenantFromHostMock.mockResolvedValue('t1')
})

describe('GET /api/produtos', () => {
  it('retorna 500 quando pocketbase falha', async () => {
    const req = new Request('http://test')
    ;(req as any).nextUrl = new URL('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toEqual([])
  })

  it('retorna 400 quando tenant não informado', async () => {
    getTenantFromHostMock.mockResolvedValueOnce(null)
    const req = new Request('http://test')
    ;(req as any).nextUrl = new URL('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Tenant não informado')
  })
})
