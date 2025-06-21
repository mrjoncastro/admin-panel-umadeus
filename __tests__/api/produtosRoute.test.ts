import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/produtos/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const pb = createPocketBaseMock()
const getFullListMock = vi.fn().mockRejectedValue(new Error('fail'))
pb.collection.mockReturnValue({
  getFullList: getFullListMock,
})
vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => pb),
}))

vi.mock('../../lib/products', () => ({
  filtrarProdutos: vi.fn((p) => p),
}))
vi.mock('../../lib/getUserFromHeaders', () => ({
  getUserFromHeaders: vi.fn(() => ({ error: 'Token ou usuário ausente.' })),
}))
let getTenantFromHostMock: any
vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: (...args: any[]) => getTenantFromHostMock(...args),
}))
getTenantFromHostMock = vi.fn()

beforeEach(() => {
  getTenantFromHostMock.mockResolvedValue('t1')
  getFullListMock.mockRejectedValue(new Error('fail'))
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

  it('retorna lista quando visitante sem autenticação', async () => {
    const produtos = [
      { id: 'p1', imagens: ['img1.jpg'], ativo: true, exclusivo_user: false },
    ]
    getFullListMock.mockResolvedValueOnce(produtos)
    pb.files.getURL.mockImplementation((_p, img) => `url/${img}`)
    const req = new Request('http://test')
    ;(req as any).nextUrl = new URL('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].imagens[0]).toBe('url/img1.jpg')
  })
})
