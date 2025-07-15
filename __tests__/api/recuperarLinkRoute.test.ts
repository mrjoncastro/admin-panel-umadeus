import { describe, it, expect, vi } from 'vitest'
import { POST } from '../../app/api/recuperar-link/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

vi.mock('../../lib/server/logger', () => ({
  logConciliacaoErro: vi.fn(),
  logRocketEvent: vi.fn(),
}))

const pb = createPocketBaseMock()
const getFirstCobranca = vi.fn()
const getFirstInscricao = vi.fn()
const getFirstPedido = vi.fn()

pb.collection.mockImplementation((name: string) => {
  if (name === 'cobrancas') {
    return { getFirstListItem: getFirstCobranca }
  }
  if (name === 'inscricoes') {
    return { getFirstListItem: getFirstInscricao }
  }
  if (name === 'pedidos') {
    return { getFirstListItem: getFirstPedido }
  }
  return {}
})

vi.mock('../../lib/pocketbase', () => ({ default: vi.fn(() => pb) }))
vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: vi.fn(() => 'cli1'),
}))

describe('POST /api/recuperar-link', () => {
  it('retorna link de pagamento quando cobranca ativa', async () => {
    getFirstCobranca.mockResolvedValueOnce({
      status: 'PENDING',
      dueDate: new Date(Date.now() + 86_400_000).toISOString(),
      invoiceUrl: 'http://pay',
      pedido: 'p1',
      nomeUsuario: 'U',
    })
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ cpf: '12345678901' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.link_pagamento).toBe('http://pay')
    expect(body.nomeUsuario).toBe('U')
  })

  it('retorna link mesmo quando cobranca vencida', async () => {
    getFirstCobranca.mockResolvedValueOnce({
      status: 'OVERDUE',
      dueDate: new Date(Date.now() - 86_400_000).toISOString(),
      invoiceUrl: 'http://expired',
      pedido: 'p1',
      nomeUsuario: 'U',
    })
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ cpf: '12345678901' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.link_pagamento).toBe('http://expired')
    expect(body.nomeUsuario).toBe('U')
  })

  it('retorna status pendente quando inscricao em aprovacao', async () => {
    getFirstCobranca.mockRejectedValueOnce(new Error('not found'))
    getFirstInscricao.mockResolvedValueOnce({ status: 'pendente' })
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ cpf: '12345678901' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('pendente')
  })

  it('retorna link quando inscricao aguardando pagamento', async () => {
    getFirstCobranca.mockRejectedValueOnce(new Error('not found'))
    getFirstInscricao.mockResolvedValueOnce({
      id: 'i1',
      status: 'aguardando_pagamento',
      nome: 'Ana',
    })
    getFirstPedido.mockResolvedValueOnce({
      id: 'p1',
      link_pagamento: 'http://pay2',
    })
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ cpf: '12345678901' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.link_pagamento).toBe('http://pay2')
    expect(body.nomeUsuario).toBe('Ana')
  })

  it('retorna 404 quando inscricao inexistente', async () => {
    getFirstCobranca.mockRejectedValueOnce(new Error('not found'))
    getFirstInscricao.mockRejectedValueOnce(new Error('not found'))
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ cpf: '12345678901' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(404)
  })
})
