import { describe, it, expect, vi } from 'vitest'
import { POST } from '../../app/admin/api/usuarios/route'
import { NextRequest } from 'next/server'

vi.mock('../../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { requireRole } from '../../lib/apiAuth'

describe('POST /admin/api/usuarios', () => {
  it('cria usuario quando dados validos', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: 'u1' })
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({
      pb: { collection: () => ({ create: createMock }) } as any,
      user: { cliente: 'cli1' },
    })

    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Test',
        email: 't@test.com',
        telefone: '11999999999',
        cpf: '52998224725',
        data_nascimento: '2000-01-01',
        endereco: 'rua',
        numero: '1',
        estado: 'BA',
        cep: '00000000',
        cidade: 'c',
        password: 'p',
        passwordConfirm: 'p',
        role: 'usuario',
        campo: 'c1',
      }),
    })

    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(201)
    expect(createMock).toHaveBeenCalledWith({
      nome: 'Test',
      email: 't@test.com',
      telefone: '11999999999',
      cpf: '52998224725',
      data_nascimento: '2000-01-01',
      endereco: 'rua',
      numero: '1',
      estado: 'BA',
      cep: '00000000',
      cidade: 'c',
      password: 'p',
      passwordConfirm: 'p',
      role: 'usuario',
      campo: 'c1',
      cliente: 'cli1',
    })
    const body = await res.json()
    expect(body.id).toBe('u1')
  })
})
