import { describe, it, expect, vi } from 'vitest'
import { POST as POST_INSTANCE } from '../../app/api/chats/whatsapp/instance/route'
import { POST as POST_STATE } from '../../app/api/chats/whatsapp/instance/connectionState/route'
import { POST as POST_SEND } from '../../app/api/chats/whatsapp/message/sendTest/[instanceName]/route'
import { NextRequest } from 'next/server'

vi.mock('../../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { requireRole } from '../../lib/apiAuth'
vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => ({
    collection: vi.fn(() => ({
      getOne: vi.fn(),
      getFirstListItem: vi.fn(),
      update: vi.fn(),
    })),
    admins: { authWithPassword: vi.fn() },
    authStore: { isValid: true },
  })),
}))

const pbMock = (requireRole as unknown as { mockReturnValue: (v: any) => void })

pbMock.mockReturnValue({ pb: {} as any, user: {} })

describe('POST /api/chats/whatsapp/instance', () => {
  it('retorna 400 quando tenant ausente', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ telefone: '+5511999999999' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST_INSTANCE(req as unknown as NextRequest)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Tenant ausente')
  })

  it('retorna 400 quando telefone invalido', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      headers: { 'x-tenant-id': 't1' },
      body: JSON.stringify({ telefone: '123' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST_INSTANCE(req as unknown as NextRequest)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('invalid_phone')
  })
})

describe('POST /api/chats/whatsapp/instance/connectionState', () => {
  it('retorna 400 quando tenant ausente', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ instanceName: 'i', apiKey: 'k' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST_STATE(req as unknown as NextRequest)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Tenant ausente')
  })
})

describe('POST /api/chats/whatsapp/message/sendTest/[instanceName]', () => {
  it('retorna 400 quando instanceName ausente', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      headers: { 'x-tenant-id': 't1' },
      body: JSON.stringify({ to: '123' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST_SEND(req as unknown as NextRequest, { params: Promise.resolve({}) })
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando tenant ausente', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ to: '123' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST_SEND(req as unknown as NextRequest, { params: Promise.resolve({ instanceName: 'i' }) })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Tenant ausente')
  })
})
