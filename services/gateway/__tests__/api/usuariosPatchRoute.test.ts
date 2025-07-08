import { describe, it, expect, vi } from 'vitest'
import { PATCH } from '../../app/api/usuarios/[id]/route'
import { NextRequest } from 'next/server'

vi.mock('../../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { requireRole } from '../../lib/apiAuth'

describe('PATCH /api/usuarios/[id]', () => {
  it('remove caracteres nao numericos e envia endereco completo', async () => {
    const updateMock = vi.fn().mockResolvedValue({})
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({
      pb: { collection: () => ({ update: updateMock }) } as any,
      user: { id: 'u1', role: 'usuario' },
    })

    const req = new Request('http://test/api/usuarios/u1', {
      method: 'PATCH',
      body: JSON.stringify({
        nome: 'Nome',
        telefone: '(11) 99999-9999',
        cpf: '529.982.247-25',
        endereco: ' Rua A ',
        numero: '123',
        bairro: ' Centro ',
        cidade: 'Sao Paulo',
        estado: 'SP',
        cep: '12345-678',
      }),
    })
    ;(req as any).nextUrl = new URL('http://test/api/usuarios/u1')

    const res = await PATCH(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(updateMock).toHaveBeenCalledWith('u1', {
      nome: 'Nome',
      telefone: '11999999999',
      cpf: '52998224725',
      data_nascimento: '',
      endereco: 'Rua A',
      numero: '123',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      estado: 'SP',
      cep: '12345678',
      role: 'usuario',
    })
  })
})
