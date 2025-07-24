// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { describe, it, expect, vi } from 'vitest'
import { POST as POST_INSTANCE } from '../../app/api/chats/whatsapp/instance/route'
import { POST as POST_STATE } from '../../app/api/chats/whatsapp/instance/connectionState/route'
import { POST as POST_CONNECT } from '../../app/api/chats/whatsapp/instance/connect/route'
import { POST as POST_SEND } from '../../app/api/chats/whatsapp/message/sendTest/[instanceName]/route'
import { NextRequest } from 'next/server'
// [REMOVED] PocketBase import

vi.mock('../../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { requireRole } from '../../lib/apiAuth'

const pb = createPocketBaseMock()
vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => pb),
}))(
  requireRole as unknown as { mockReturnValue: (v: any) => void },
).mockReturnValue({ pb, user: {} })

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
    const res = await POST_SEND(req as unknown as NextRequest, {
      params: Promise.resolve({}),
    })
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando tenant ausente', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ to: '123' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST_SEND(req as unknown as NextRequest, {
      params: Promise.resolve({ instanceName: 'i' }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Tenant ausente')
  })
})

describe('POST /api/chats/whatsapp/instance/connect', () => {
  it('retorna 404 quando instancia inexistente', async () => {
    // pb. // [REMOVED] collection.mockReturnValueOnce({
      getFullList: vi.fn().mockResolvedValue([]),
    })
    const req = new Request('http://test', {
      method: 'POST',
      headers: { 'x-tenant-id': 't1' },
      body: JSON.stringify({ instanceName: 'i', apiKey: 'k' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST_CONNECT(req as unknown as NextRequest)
    expect(res.status).toBe(404)
  })

  it('retorna dados de QR quando sucesso', async () => {
    const getFullList = vi.fn().mockResolvedValue([{ id: '1' }])
    const update = vi.fn().mockResolvedValue({ qrCode: 'url.png' })
    // pb. // [REMOVED] collection.mockReturnValue({ getFullList, update })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ pairingCode: 'p', base64: 'abc' }),
    }) as unknown as typeof fetch
    const req = new Request('http://test', {
      method: 'POST',
      headers: { 'x-tenant-id': 't1' },
      body: JSON.stringify({ instanceName: 'i', apiKey: 'k' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST_CONNECT(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.pairingCode).toBe('p')
    expect(body.qrCodeUrl).toBe('url.png')
    expect(body.qrBase64).toBe('abc')
  })
})

describe('POST /api/chats/whatsapp/instance/connectionState sucesso', () => {
  it('atualiza status para connected quando aberto', async () => {
    const getFullList = vi.fn().mockResolvedValue([{ id: '1' }])
    const update = vi.fn()
    // pb. // [REMOVED] collection.mockReturnValue({ getFullList, update })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ instance: { state: 'open' } }),
    }) as unknown as typeof fetch
    const req = new Request('http://test', {
      method: 'POST',
      headers: { 'x-tenant-id': 't1' },
      body: JSON.stringify({ instanceName: 'i', apiKey: 'k' }),
    })
    ;(req as any).nextUrl = new URL('http://test')
    const res = await POST_STATE(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(update).toHaveBeenCalledWith('1', { sessionStatus: 'connected' })
  })
})
