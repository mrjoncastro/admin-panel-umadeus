import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserFromHeaders } from '../lib/getUserFromHeaders'

const mockPb = {
  authStore: { save: vi.fn() },
  autoCancellation: vi.fn()
}

vi.mock('../lib/pocketbase', () => ({
  __esModule: true,
  default: vi.fn(() => mockPb)
}))

function makeRequest(token?: string, user?: string) {
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (user) headers.set('X-PB-User', user)
  return { headers } as any
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getUserFromHeaders', () => {
  it('retorna erro quando cabecalhos faltam', () => {
    const req = makeRequest()
    expect(getUserFromHeaders(req)).toEqual({ error: 'Token ou usuário ausente.' })
  })

  it('retorna erro para usuario invalido', () => {
    const req = makeRequest('tok', 'invalid')
    expect(getUserFromHeaders(req)).toEqual({ error: 'Usuário inválido.' })
  })

  it('retorna usuario e instancia do pocketbase quando cabecalhos validos', () => {
    const user = { id: '1', nome: 'Test' }
    const token = '123'
    const req = makeRequest(token, JSON.stringify(user))
    const result = getUserFromHeaders(req)
    expect('error' in result).toBe(false)
    if ('pbSafe' in result) {
      expect(result.user).toEqual(user)
      expect(mockPb.authStore.save).toHaveBeenCalledWith(token, user)
      expect(mockPb.autoCancellation).toHaveBeenCalledWith(false)
    }
  })
})
