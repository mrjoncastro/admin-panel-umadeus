import { describe, it, expect, vi } from 'vitest'
import { POST } from '../../app/api/recuperar-link/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const pb = createPocketBaseMock()
const getFullListMock = vi.fn()

pb.collection.mockImplementation((name: string) => {
  if (name === 'inscricoes') {
    return { getFullList: getFullListMock }
  }
  return {}
})

vi.mock('../../lib/pocketbase', () => ({ default: vi.fn(() => pb) }))
vi.mock('../../lib/getTenantFromHost', () => ({ getTenantFromHost: vi.fn(() => 'cli1') }))

describe('POST /api/recuperar-link', () => {
  it('retorna link de pagamento quando pendente', async () => {
    getFullListMock.mockResolvedValueOnce([
      {
        status: 'ativo',
        confirmado_por_lider: true,
        expand: { pedido: { status: 'pendente', link_pagamento: 'http://pay' } },
      },
    ])
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ cpf: '1' }),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('pendente')
    expect(body.link_pagamento).toBe('http://pay')
  })

  it('retorna 404 quando inscricao nao encontrada', async () => {
    getFullListMock.mockResolvedValueOnce([])
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ cpf: '1' }),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(404)
  })

  it('retorna 500 em falha inesperada', async () => {
    getFullListMock.mockRejectedValueOnce(new Error('fail'))
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ cpf: '1' }),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(500)
  })
})
