import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from '../../app/api/inscricoes/[id]/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

vi.mock('../../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { requireRole } from '../../lib/apiAuth'

vi.mock('../../lib/server/logger', () => ({ logConciliacaoErro: vi.fn() }))
import { logConciliacaoErro } from '../../lib/server/logger'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PATCH /api/inscricoes/[id]', () => {
  it('tenta atualizar novamente quando ocorre erro de rede', async () => {
    const updateMock = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error('fetch failed'), { status: 0 }),
      )
      .mockResolvedValue({ id: 'i1', status: 'pago' })
    const getOneMock = vi.fn().mockResolvedValue({ id: 'i1', criado_por: 'u1' })
    const pb = createPocketBaseMock()
    pb.collection.mockImplementation(() => ({
      update: updateMock,
      getOne: getOneMock,
    }))
    ;(requireRole as any).mockReturnValue({
      pb,
      user: { id: 'u1', role: 'usuario' },
    })

    const req = new Request('http://test/api/inscricoes/i1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'pago' }),
    })
    ;(req as any).nextUrl = new URL('http://test/api/inscricoes/i1')

    const res = await PATCH(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(updateMock).toHaveBeenCalledTimes(2)
    expect(logConciliacaoErro).not.toHaveBeenCalled()
  })

  it('registra erro quando atualizacao falha', async () => {
    const error = Object.assign(new Error('fetch failed'), { status: 0 })
    const updateMock = vi.fn().mockRejectedValue(error)
    const getOneMock = vi.fn().mockResolvedValue({ id: 'i1', criado_por: 'u1' })
    const pb = createPocketBaseMock()
    pb.collection.mockImplementation(() => ({
      update: updateMock,
      getOne: getOneMock,
    }))
    ;(requireRole as any).mockReturnValue({
      pb,
      user: { id: 'u1', role: 'usuario' },
    })

    const req = new Request('http://test/api/inscricoes/i1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'pago' }),
    })
    ;(req as any).nextUrl = new URL('http://test/api/inscricoes/i1')

    const res = await PATCH(req as unknown as NextRequest)
    expect(res.status).toBe(500)
    expect(logConciliacaoErro).toHaveBeenCalled()
    expect(updateMock).toHaveBeenCalled()
  })
})
