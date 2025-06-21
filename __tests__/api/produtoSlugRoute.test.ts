import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/produtos/[slug]/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const pb = createPocketBaseMock()
const getFirstListItemMock = vi.fn()
pb.collection.mockReturnValue({ getFirstListItem: getFirstListItemMock })
vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => pb),
}))

vi.mock('../../lib/getUserFromHeaders', () => ({
  getUserFromHeaders: vi.fn(() => ({ error: 'Token ou usuário ausente.' })),
}))

let getTenantFromHostMock: any
vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: (...args: any[]) => getTenantFromHostMock(...args),
}))
getTenantFromHostMock = vi.fn().mockResolvedValue(null)

beforeEach(() => {
  getTenantFromHostMock.mockResolvedValue('t1')
})

describe('GET /api/produtos/[slug]', () => {
  it('retorna 400 quando tenant não informado', async () => {
    getTenantFromHostMock.mockResolvedValueOnce(null)
    const req = new Request('http://test/produtos/p')
    ;(req as any).nextUrl = new URL('http://test/produtos/p')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Tenant não informado')
  })

  it('retorna produto quando visitante', async () => {
    const produto = { id: 'p1', imagens: ['img1.jpg'], ativo: true }
    getFirstListItemMock.mockResolvedValueOnce(produto)
    pb.files.getURL.mockImplementation((_p, img) => `url/${img}`)
    const req = new Request('http://test/produtos/p1')
    ;(req as any).nextUrl = new URL('http://test/produtos/p1')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.imagens[0]).toBe('url/img1.jpg')
  })
})
