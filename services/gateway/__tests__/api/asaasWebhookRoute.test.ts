// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../../app/api/asaas/webhook/route'
import { NextRequest } from 'next/server'
// [REMOVED] PocketBase import

const pb = createPocketBaseMock()
const getFirstConfig = vi.fn()
const getOneConfig = vi.fn()
const getFirstPedido = vi.fn()
const updatePedido = vi.fn()
const updateInscricao = vi.fn()

// pb. // [REMOVED] collection.mockImplementation((name: string) => {
  if (name === 'clientes_config')
    return { getFirstListItem: getFirstConfig, getOne: getOneConfig }
  if (name === 'pedidos')
    return {
      getFirstListItem: getFirstPedido,
      update: updatePedido,
      getList: vi.fn(),
    }
  if (name === 'inscricoes') return { update: updateInscricao, getOne: vi.fn() }
  return {} as any
})

vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => pb),
}))

vi.mock('../../lib/server/logger', () => ({ logConciliacaoErro: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.ASAAS_API_URL = 'http://asaas'
  getFirstConfig.mockResolvedValue({
    asaas_api_key: '$key',
    id: 'cli1',
    nome: 'Cli',
  })
  getOneConfig.mockResolvedValue({
    asaas_api_key: '$key',
    id: 'cli1',
    nome: 'Cli',
  })
  getFirstPedido.mockResolvedValue({ id: 'p1', responsavel: 'u1' })
  updatePedido.mockResolvedValue({})
  updateInscricao.mockResolvedValue({})
})

describe('POST /api/asaas/webhook', () => {
  it('envia notificacoes quando pagamento confirmado', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'RECEIVED',
            externalReference: 'cliente_cli1_usuario_u1_inscricao_ins1',
            customer: 'c1',
          }),
      })
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    global.fetch = fetchMock as unknown as typeof fetch

    const payload = {
      payment: { id: 'pay1', accountId: 'acc1' },
      event: 'PAYMENT_RECEIVED',
    }
    const req = new Request('http://test/api/asaas/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    ;(req as any).nextUrl = new URL('http://test/api/asaas/webhook')

    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://asaas/payments/pay1',
      expect.any(Object),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'http://test/api/email',
      expect.any(Object),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'http://test/api/chats/message/sendWelcome',
      expect.any(Object),
    )
    const body = JSON.parse((fetchMock.mock.calls[1][1] as any).body as string)
    expect(body.userId).toBe('u1')
  })

  it('retorna 500 quando falha ao criar registro', async () => {
    const createWebhookTask = vi
      .fn()
      .mockRejectedValue(new Error('Failed to create record.'))

    // pb. // [REMOVED] collection.mockImplementation((name: string) => {
      if (name === 'clientes_config')
        return { getFirstListItem: getFirstConfig, getOne: getOneConfig }
      if (name === 'pedidos')
        return {
          getFirstListItem: getFirstPedido,
          update: updatePedido,
          getList: vi.fn(),
        }
      if (name === 'inscricoes')
        return { update: updateInscricao, getOne: vi.fn() }
      if (name === 'webhook_tasks') return { create: createWebhookTask }
      return {} as any
    })

    const payload = {
      payment: { id: 'pay1', accountId: 'acc1' },
      event: 'PAYMENT_RECEIVED',
    }
    const req = new Request('http://test/api/asaas/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    ;(req as any).nextUrl = new URL('http://test/api/asaas/webhook')

    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json).toEqual({
      error: 'Erro interno',
      details: 'Failed to create record.',
    })
  })
})
