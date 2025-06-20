import { describe, it, expect, vi } from 'vitest'
import { POST } from '../../app/api/register/route'
import { NextRequest } from 'next/server'

const getOneMock = vi.fn().mockRejectedValue(new Error('not found'))
const createMock = vi.fn().mockResolvedValue({ id: 'u1' })

vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => ({
    collection: () => ({ getOne: getOneMock, create: createMock }),
  })),
}))

describe('POST /api/register', () => {
  it('retorna 404 se cliente nao encontrado', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'n',
        email: 'e',
        telefone: 't',
        cpf: '1',
        data_nascimento: '2000-01-01',
        endereco: 'rua',
        numero: '1',
        estado: 'BA',
        cep: '000',
        cidade: 'c',
        password: 'p',
        cliente: '1',
      }),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Cliente não encontrado')
  })

  it('cria usuario quando cliente existe', async () => {
    getOneMock.mockResolvedValueOnce({ id: 'c1' })
    const payload = {
      nome: 'n',
      email: 'e',
      telefone: 't',
      cpf: '1',
      data_nascimento: '2000-01-01',
      endereco: 'rua',
      numero: '1',
      estado: 'BA',
      cep: '000',
      cidade: 'c',
      password: 'p',
      cliente: '1',
    }
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(201)
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining(payload))
  })
})
