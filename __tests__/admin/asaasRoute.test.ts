import { describe, it, expect, vi, afterEach } from 'vitest'
import { POST } from '../../app/admin/api/asaas/route'
import { NextRequest } from 'next/server'
vi.mock('../../lib/clienteAuth', () => ({ requireClienteFromHost: vi.fn() }))
import { requireClienteFromHost } from '../../lib/clienteAuth'
import { calculateGross } from '../../lib/asaasFees'

describe('POST /admin/api/asaas', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna 403 quando requireClienteFromHost falha', async () => {
    (requireClienteFromHost as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
      error: 'Acesso negado',
      status: 403
    })
    const req = new Request('http://test', { method: 'POST', body: '{}' })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(403)
  })

  it('lança erro quando ASAAS_API_KEY ausente', async () => {
    (requireClienteFromHost as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
      pb: {
        authStore: { isValid: true },
        admins: { authWithPassword: vi.fn() },
        collection: () => ({ getOne: vi.fn(), update: vi.fn() })
      } as any,
      cliente: {}
    })
    delete process.env.ASAAS_API_KEY
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ pedidoId:'1', valorLiquido:1, paymentMethod:'pix', installments:1 }) })
    await expect(POST(req as unknown as NextRequest)).rejects.toThrow()
  })

  it('envia valor bruto calculado no payload', async () => {
    const pb = {
      authStore: { isValid: true },
      admins: { authWithPassword: vi.fn() },
      collection: (name: string) => {
        if (name === 'pedidos') {
          return {
            getOne: vi.fn().mockResolvedValue({
              id: 'p1',
              produto: 'Produto',
              id_inscricao: 'ins1',
              responsavel: 'u1',
              cliente: 'c1',
            }),
            update: vi.fn().mockResolvedValue(undefined),
          }
        }
        if (name === 'inscricoes') {
          return {
            getOne: vi.fn().mockResolvedValue({
              id: 'ins1',
              nome: 'Joao',
              email: 'j@x.com',
              cpf: '000',
              telefone: '111',
              endereco: 'rua',
              numero: '1',
              campo: 'c1',
              criado_por: 'u1',
            }),
          }
        }
        return { getFirstListItem: vi.fn() }
      },
    }

    ;(requireClienteFromHost as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
      pb,
      cliente: { nome: 'Cliente', asaas_api_key: 'key' },
    })

    const baseUrl = 'https://asaas'
    process.env.ASAAS_API_URL = baseUrl
    process.env.WALLETID_M24 = 'wallet'

    const paymentResText = JSON.stringify({ invoiceUrl: 'url' })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('{"id":"c"}') })
      .mockResolvedValue({
        ok: true,
        clone: () => ({ text: () => Promise.resolve(paymentResText) }),
        text: () => Promise.resolve(paymentResText),
      })

    global.fetch = fetchMock as unknown as typeof fetch

    const body = {
      pedidoId: 'p1',
      valorLiquido: 10,
      paymentMethod: 'pix',
      installments: 1,
    }

    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const res = await POST(req as unknown as NextRequest)
    await res.json()

    const sentBody = JSON.parse(fetchMock.mock.calls[2][1].body)
    const { gross, margin } = calculateGross(10, 'pix', 1)
    expect(sentBody.value).toBe(gross)
    expect(sentBody.split[0].fixedValue).toBe(margin)
  })
})
