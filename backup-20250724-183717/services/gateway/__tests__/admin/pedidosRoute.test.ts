// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../../app/api/pedidos/route'
import { NextRequest } from 'next/server'
// [REMOVED] PocketBase import

const pb = createPocketBaseMock()
vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => pb),
}))

let getTenantFromHostMock: any
vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: (...args: any[]) => getTenantFromHostMock(...args),
}))

beforeEach(() => {
  getTenantFromHostMock = vi.fn().mockResolvedValue('cli1')
  // pb. // [REMOVED] collection.mockReset()
  // pb. // [REMOVED] authStore.model = { id: 'u1' }
})

describe('POST /admin/api/pedidos', () => {
  it('retorna 400 quando tenant nao encontrado', async () => {
    getTenantFromHostMock.mockResolvedValueOnce(null)
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(400)
  })

  it('retorna 401 quando usuario nao autenticado', async () => {
    // pb. // [REMOVED] authStore.model = undefined
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ produto: ['P'] }),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(401)
  })

  it('cria pedido da loja e retorna id', async () => {
    const createMock = vi
      .fn()
      .mockResolvedValue({ id: 'p1', valor: 10, status: 'pendente' })
    // pb. // [REMOVED] collection.mockReturnValue({ create: createMock })

    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        produto: ['Produto'],
        valor: 10,
        tamanho: 'M',
        cor: 'Azul',
        genero: 'M',
        campoId: 'c1',
        email: 'x@y.com',
      }),
    })

    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.pedidoId).toBe('p1')
  })
})
