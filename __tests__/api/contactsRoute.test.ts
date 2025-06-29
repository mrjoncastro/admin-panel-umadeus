import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

vi.mock('../../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { requireRole } from '../../lib/apiAuth'

let GET: any
let pb: any

beforeEach(async () => {
  vi.clearAllMocks()
  pb = createPocketBaseMock()
  ;(
    requireRole as unknown as { mockReturnValue: (v: any) => void }
  ).mockReturnValue({ pb, user: { cliente: 'cli1' } })
  const module = await import('../../app/api/chats/contacts/route')
  GET = module.GET
})

describe('GET /api/chats/contacts', () => {
  it('nega acesso quando usuario nao e coordenador', async () => {
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValueOnce({ error: 'not allowed', status: 403 })
    const req = new Request('http://test')
    ;(req as any).nextUrl = new URL('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('not allowed')
  })

  it('retorna lista de contatos com id, name, phone e avatarUrl', async () => {
    const contacts = [
      { id: 'u1', nome: 'Fulano', telefone: '123', avatar: 'a.jpg', cliente: 'cli1' },
      { id: 'u2', nome: 'Beltrano', telefone: null, avatar: undefined, cliente: 'cli1' },
    ]
    const getFullList = vi.fn().mockResolvedValue(contacts)
    pb.collection.mockReturnValue({ getFullList })
    pb.files.getUrl.mockImplementation((_user, avatar) => `url/${avatar}`)

    const req = new Request('http://test')
    ;(req as any).nextUrl = new URL('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(2)
    expect(body[0]).toEqual({ id: 'u1', name: 'Fulano', phone: '123', avatarUrl: 'url/a.jpg' })
    expect(body[1]).toEqual({ id: 'u2', name: 'Beltrano', phone: undefined, avatarUrl: undefined })
  })
})
