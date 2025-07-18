import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/usuarios/by-cpf/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const pb = createPocketBaseMock()
const getFirstMock = vi.fn()

pb.collection.mockImplementation((name: string) => {
  if (name === 'usuarios') {
    return { getFirstListItem: getFirstMock }
  }
  return {}
})

vi.mock('../lib/pocketbase', () => ({ default: vi.fn(() => pb) }))

describe('GET /api/usuarios/by-cpf', () => {
  it('retorna 400 quando cpf invalido', async () => {
    const req = new Request('http://test/api/usuarios/by-cpf?cpf=123')
    ;(req as any).nextUrl = new URL('http://test/api/usuarios/by-cpf?cpf=123')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(400)
  })

  it('retorna dados quando encontrado', async () => {
    getFirstMock.mockResolvedValueOnce({
      id: 'u1',
      nome: 'Fulano',
      telefone: '11999999999',
      email: 'f@x.com',
    })
    const req = new Request('http://test/api/usuarios/by-cpf?cpf=52998224725')
    ;(req as any).nextUrl = new URL('http://test/api/usuarios/by-cpf?cpf=52998224725')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('u1')
    expect(getFirstMock).toHaveBeenCalled()
  })
})
