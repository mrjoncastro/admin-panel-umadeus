import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const pbMock = () => ({
  authStore: { isValid: false, model: null as any, save: vi.fn() },
  autoCancellation: vi.fn(),
})

vi.mock('../lib/pbWithAuth', () => {
  return { getPocketBaseFromRequest: vi.fn(() => pbMock()) }
})

import { getUserFromHeaders } from '../lib/getUserFromHeaders'
import { getPocketBaseFromRequest } from '../lib/pbWithAuth'

describe('getUserFromHeaders', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna erro quando cabeçalhos faltam', () => {
    const req = new Request('http://test')
    const result = getUserFromHeaders(req as unknown as NextRequest)
    expect(result).toEqual({ error: 'Token ou usuário ausente.' })
  })

  it('retorna erro quando usuário é inválido', () => {
    const headers = new Headers({
      Authorization: 'Bearer token',
      'X-PB-User': 'invalid-json',
    })
    const req = new Request('http://test', { headers })
    const result = getUserFromHeaders(req as unknown as NextRequest)
    expect(result).toEqual({ error: 'Usuário inválido.' })
  })

  it('retorna usuário e pocketbase quando sucesso', () => {
    const user = { id: '1', role: 'admin' }
    const headers = new Headers({
      Authorization: 'Bearer token123',
      'X-PB-User': JSON.stringify(user),
    })
    const req = new Request('http://test', { headers })
    const result = getUserFromHeaders(req as unknown as NextRequest)
    const pb = (getPocketBaseFromRequest as unknown as vi.Mock).mock.results[0]
      .value
    expect(result).toEqual({ user, pbSafe: pb })
    expect(pb.authStore.save).toHaveBeenCalledWith('token123', user)
  })
})
