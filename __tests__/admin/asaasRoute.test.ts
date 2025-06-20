import { describe, it, expect, vi, afterEach } from 'vitest'
import { POST } from '../../app/admin/api/asaas/route'
import { NextRequest } from 'next/server'
vi.mock('../../lib/clienteAuth', () => ({ requireClienteFromHost: vi.fn() }))
import { requireClienteFromHost } from '../../lib/clienteAuth'

describe('POST /admin/api/asaas', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna 403 quando autenticacao falha', async () => {
    ;(
      requireClienteFromHost as unknown as { mockReturnValue: (v: any) => void }
    ).mockResolvedValue({
      error: 'Acesso negado',
      status: 403,
    })
    const req = new Request('http://test', { method: 'POST', body: '{}' })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(403)
  })

  it('lança erro quando ASAAS_API_KEY ausente', async () => {
    ;(
      requireClienteFromHost as unknown as { mockReturnValue: (v: any) => void }
    ).mockResolvedValue({
      pb: {
        authStore: { isValid: true },
        admins: { authWithPassword: vi.fn() },
        collection: () => ({ getFirstListItem: vi.fn() }),
      },
      cliente: { asaas_api_key: undefined, nome: 'Cli' },
    })
    delete process.env.ASAAS_API_KEY
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        pedidoId: '1',
        valorBruto: 1,
        paymentMethod: 'pix',
        installments: 1,
      }),
    })
    await expect(POST(req as unknown as NextRequest)).rejects.toThrow()
  })

  it('envia billingType correto no payload', async () => {
    const pb = {
      authStore: { isValid: true },
      admins: { authWithPassword: vi.fn() },
      collection: vi.fn((name: string) => {
        if (name === 'pedidos') {
          return {
            getOne: vi.fn().mockResolvedValue({
              id: 'p1',
              id_inscricao: 'i1',
              responsavel: 'u1',
              produto: 'Produto',
            }),
            update: vi.fn(),
          }
        }
        if (name === 'inscricoes') {
          return {
            getOne: vi.fn().mockResolvedValue({
              id: 'i1',
              nome: 'Nome',
              email: 'n@a.com',
              cpf: '000',
              telefone: '1',
              endereco: 'E',
              numero: '1',
              campo: 'cli1',
              criado_por: 'u1',
            }),
          }
        }
        return {}
      }),
    } as any

    ;(
      requireClienteFromHost as unknown as { mockReturnValue: (v: any) => void }
    ).mockResolvedValue({ pb, cliente: { nome: 'Cli', asaas_api_key: 'key' } })

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"id":"c1"}'),
      })
      .mockResolvedValueOnce({
        ok: true,
        clone: () => ({ text: () => Promise.resolve('{"invoiceUrl":"pay"}') }),
        text: () => Promise.resolve('{"invoiceUrl":"pay"}'),
      }) as unknown as typeof fetch

    process.env.ASAAS_API_URL = 'https://asaas'
    process.env.ASAAS_API_KEY = 'key'
    process.env.WALLETID_M24 = 'wallet'

    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        pedidoId: 'p1',
        valorBruto: 10,
        paymentMethod: 'pix',
        installments: 1,
      }),
    })

    const res = await POST(req as unknown as NextRequest)
    const body = await res.json()
    expect(body.url).toBe('pay')
    const sent = JSON.parse((global.fetch as any).mock.calls[2][1].body)
    expect(sent.billingType).toBe('PIX')
  })
})
