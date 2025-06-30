import { describe, it, expect, vi } from 'vitest'
import { POST } from '../../app/api/signup/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const createMock = vi.fn().mockResolvedValue({ id: '1' })
const pb = createPocketBaseMock()
pb.collection.mockReturnValue({ create: createMock })

vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => pb),
}))

vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: vi.fn(async () => null),
}))

describe('POST /api/signup', () => {
  it('retorna 422 quando email ausente', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ nome: 'Nome' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.error).toBe('validation_failed')
    expect(body.fields.email).toBeDefined()
  })
  it('remove caracteres nao numericos de telefone e cpf', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    global.fetch = fetchMock as unknown as typeof fetch

    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Nome',
        email: 'e@test.com',
        telefone: '(11) 99999-9999',
        cpf: '529.982.247-25',
        senha: '123',
      }),
    })
    ;(req as any).nextUrl = new URL('http://test')

    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(201)
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        telefone: '11999999999',
        cpf: '52998224725',
      }),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'http://test/api/email',
      expect.any(Object),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'http://test/api/chats/message/sendWelcome',
      expect.any(Object),
    )
  })
})
