import { describe, it, expect, vi } from 'vitest'
import { POST, GET, DELETE } from '../../app/api/chats/message/broadcast/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const pb = createPocketBaseMock()
const getCfgMock = vi.fn()
const getUsersMock = vi.fn()

pb.collection.mockImplementation((name: string) => {
  if (name === 'whatsapp_clientes') {
    return { getFullList: getCfgMock }
  }
  if (name === 'usuarios') {
    return { getFullList: getUsersMock }
  }
  return {}
})

vi.mock('../../lib/pocketbase', () => ({ default: vi.fn(() => pb) }))
const queueTextMessage = vi.fn()
vi.mock('../../lib/server/chats', () => ({ queueTextMessage }))

const getStats = vi.fn()
const cancel = vi.fn()
vi.mock('../../lib/server/flows/whatsapp', () => ({
  broadcastManager: { getStats, cancel },
}))

describe('POST /api/chats/message/broadcast', () => {
  it('retorna 400 quando tenant ausente', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ target: 'lideres', message: 'Oi' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(400)
  })

  it('enfileira mensagens para telefones unicos', async () => {
    getCfgMock.mockResolvedValueOnce([{ instanceName: 'i', apiKey: 'k' }])
    getUsersMock.mockResolvedValueOnce([
      { telefone: '111' },
      { telefone: '222' },
      { telefone: '111' },
    ])
    const req = new Request('http://test', {
      method: 'POST',
      headers: { 'x-tenant-id': 't1' },
      body: JSON.stringify({ target: 'lideres', message: 'Oi' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(queueTextMessage).toHaveBeenCalledTimes(2)
  })
})

describe('GET /api/chats/message/broadcast', () => {
  it('retorna progresso da fila', async () => {
    getStats.mockReturnValue({ total: 2, sent: 1, failed: 0, pending: 1 })
    const req = new Request('http://test', { headers: { 'x-tenant-id': 't1' } })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.total).toBe(2)
    expect(body.sent).toBe(1)
  })
})

describe('DELETE /api/chats/message/broadcast', () => {
  it('cancela a fila', async () => {
    const req = new Request('http://test', {
      method: 'DELETE',
      headers: { 'x-tenant-id': 't1' },
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await DELETE(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(cancel).toHaveBeenCalledWith('t1')
  })
})
