import { describe, it, expect, vi } from 'vitest'
import { POST } from '../../app/loja/api/inscricoes/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const getFirstMock = vi.fn()
const createUserMock = vi.fn()
const createInscricaoMock = vi.fn()
const getOneEventoMock = vi.fn().mockResolvedValue({ titulo: 'Evento X' })
const pb = createPocketBaseMock()

pb.collection.mockImplementation((name: string) => {
  if (name === 'usuarios') {
    return { getFirstListItem: getFirstMock, create: createUserMock }
  }
  if (name === 'inscricoes') {
    return { create: createInscricaoMock }
  }
  if (name === 'eventos') {
    return { getOne: getOneEventoMock }
  }
  return {} as any
})

vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => pb),
}))

vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: vi.fn().mockResolvedValue('cli1'),
}))

describe('POST /loja/api/inscricoes', () => {
  it('cria usuario quando nao existe', async () => {
    getFirstMock.mockRejectedValueOnce(new Error('not found'))
    createUserMock.mockResolvedValueOnce({ id: 'u1' })
    createInscricaoMock.mockResolvedValueOnce({ id: 'i1' })

    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        user_first_name: 'J',
        user_last_name: 'D',
        user_email: 't@test.com',
        user_phone: '11999999999',
        user_cpf: '11111111111',
        user_birth_date: '2000-01-01',
        user_gender: 'masculino',
        campo: 'c1',
        evento: 'e1',
      }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(201)
    expect(createUserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'J D',
        email: 't@test.com',
        cpf: '11111111111',
        telefone: '11999999999',
        data_nascimento: '2000-01-01',
        cliente: 'cli1',
        campo: 'c1',
        perfil: 'usuario',
      }),
    )
    expect(createInscricaoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        criado_por: 'u1',
        status: 'pendente',
      }),
    )
  })

  it('usa usuario existente', async () => {
    getFirstMock.mockResolvedValueOnce({ id: 'u2' })
    createInscricaoMock.mockResolvedValueOnce({ id: 'i2' })

    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        user_first_name: 'J',
        user_last_name: 'D',
        user_email: 't@test.com',
        user_phone: '11999999999',
        user_cpf: '11111111111',
        user_birth_date: '2000-01-01',
        user_gender: 'masculino',
        campo: 'c1',
        evento: 'e1',
      }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    createUserMock.mockClear()
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(201)
    expect(createUserMock).not.toHaveBeenCalled()
    expect(createInscricaoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        criado_por: 'u2',
        status: 'pendente',
      }),
    )
  })

  it('envia notificacoes apos inscricao', async () => {
    getFirstMock.mockRejectedValueOnce(new Error('not found'))
    getFirstMock.mockResolvedValueOnce({ id: 'lid1' })
    createUserMock.mockResolvedValueOnce({ id: 'u3' })
    createInscricaoMock.mockResolvedValueOnce({ id: 'i3' })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    global.fetch = fetchMock as unknown as typeof fetch

    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        user_first_name: 'J',
        user_last_name: 'D',
        user_email: 'n@test.com',
        user_phone: '11999999999',
        user_cpf: '11111111111',
        user_birth_date: '2000-01-01',
        user_gender: 'masculino',
        campo: 'c1',
        evento: 'e1',
      }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(201)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://test/api/email',
      expect.any(Object),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'http://test/api/chats/message/sendWelcome',
      expect.any(Object),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'http://test/api/chats/message/sendWelcome',
      expect.any(Object),
    )
    const firstBody = JSON.parse((fetchMock.mock.calls[1][1] as any).body as string)
    expect(firstBody.userId).toBe('u3')
    const secondBody = JSON.parse((fetchMock.mock.calls[2][1] as any).body as string)
    expect(secondBody.userId).toBe('lid1')
  })
})
