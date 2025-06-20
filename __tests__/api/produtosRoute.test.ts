import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/produtos/route'
import { NextRequest } from 'next/server'

vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => ({
    collection: () => ({
      getFullList: vi.fn().mockRejectedValue(new Error('fail'))
    })
  }))
}))

vi.mock('../../lib/products', () => ({
  filtrarProdutos: vi.fn((p) => p)
}))
const getTenantFromHostMock = vi.fn().mockResolvedValue('t1')
vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: getTenantFromHostMock
}))

describe('GET /api/produtos', () => {
  it('retorna 500 quando pocketbase falha', async () => {
    const req = new Request('http://test')
    ;(req as any).nextUrl = new URL('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toEqual([])
  })

  it('retorna 404 quando domínio não configurado', async () => {
    getTenantFromHostMock.mockResolvedValueOnce(null)
    const req = new Request('http://test')
    ;(req as any).nextUrl = new URL('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Domínio não configurado')
  })
})
