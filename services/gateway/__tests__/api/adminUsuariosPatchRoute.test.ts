import { describe, it, expect, vi } from 'vitest'
import { PATCH } from '../../app/admin/api/usuarios/[id]/route'
import { NextRequest } from 'next/server'

vi.mock('../../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { requireRole } from '../../lib/apiAuth'

vi.mock('../../lib/services/pocketbase', () => ({
  fetchUsuario: vi.fn(),
}))
import { fetchUsuario } from '../../lib/services/pocketbase'

describe('PATCH /admin/api/usuarios/[id]', () => {
  it('atualiza campos permitidos quando mesmo tenant', async () => {
    const updateMock = vi.fn().mockResolvedValue({})
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({
      pb: { collection: () => ({ update: updateMock }) } as any,
      user: { cliente: 't1' },
    })
    ;(
      fetchUsuario as unknown as { mockResolvedValue: (v: any) => void }
    ).mockResolvedValue({ role: 'lider' })

    const req = new Request('http://test/admin/api/usuarios/u1', {
      method: 'PATCH',
      body: JSON.stringify({
        nome: 'Nome',
        telefone: '(11)99999-9999',
        cpf: '529.982.247-25',
        data_nascimento: '2000-01-01',
        role: 'lider',
        campo: 'c1',
      }),
    })
    ;(req as any).nextUrl = new URL('http://test/admin/api/usuarios/u1')

    const res = await PATCH(req as unknown as NextRequest)
    expect(fetchUsuario).toHaveBeenCalledWith(expect.anything(), 'u1', 't1')
    expect(res.status).toBe(200)
    expect(updateMock).toHaveBeenCalledWith('u1', {
      nome: 'Nome',
      telefone: '11999999999',
      cpf: '52998224725',
      data_nascimento: '2000-01-01',
      role: 'lider',
      campo: 'c1',
    })
  })

  it('nega acesso quando usuario pertence a outro tenant', async () => {
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({
      pb: {},
      user: { cliente: 't1' },
    })
    ;(
      fetchUsuario as unknown as { mockRejectedValueOnce: (v: any) => void }
    ).mockRejectedValueOnce(new Error('TENANT_MISMATCH'))

    const req = new Request('http://test/admin/api/usuarios/u1', {
      method: 'PATCH',
      body: '{}',
    })
    ;(req as any).nextUrl = new URL('http://test/admin/api/usuarios/u1')

    const res = await PATCH(req as unknown as NextRequest)
    expect(res.status).toBe(403)
  })

  it('envia notificacoes quando papel muda para lider', async () => {
    const updateMock = vi.fn().mockResolvedValue({})
    const getOneMock = vi
      .fn()
      .mockResolvedValue({ expand: { campo: { nome: 'Campo 1' } } })
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({
      pb: {
        collection: () => ({ update: updateMock, getOne: getOneMock }),
      } as any,
      user: { cliente: 't1' },
    })
    ;(
      fetchUsuario as unknown as { mockResolvedValue: (v: any) => void }
    ).mockResolvedValue({ role: 'usuario' })

    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    global.fetch = fetchMock as unknown as typeof fetch

    const req = new Request('http://test/admin/api/usuarios/u1', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'lider' }),
    })
    ;(req as any).nextUrl = new URL('http://test/admin/api/usuarios/u1')

    const res = await PATCH(req as unknown as NextRequest)
    expect(res.status).toBe(200)
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
