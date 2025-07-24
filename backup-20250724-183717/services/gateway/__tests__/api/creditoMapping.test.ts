// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { describe, it, expect, vi } from 'vitest'
import { POST as postInscricoes } from '../../app/api/inscricoes/route'
import { POST as postAsaas } from '../../app/api/asaas/route'
import { NextRequest } from 'next/server'
// [REMOVED] PocketBase import

vi.mock('../../lib/pocketbase', () => ({ default: vi.fn() }))
vi.mock('../../lib/clienteAuth', () => ({ requireClienteFromHost: vi.fn() }))
import { requireClienteFromHost } from '../../lib/clienteAuth'

describe('Mapeamento Credito para pix', () => {
  it('normaliza na rota /api/inscricoes', async () => {
    const getLider = vi.fn().mockResolvedValue({
      expand: { campo: { id: 'c1' } },
      cliente: 'cli1',
    })
    const getUser = vi.fn().mockResolvedValue({ id: 'u1' })
    const getInscricao = vi.fn().mockRejectedValue(new Error('not found'))
    const createInscricao = vi.fn().mockResolvedValue({ id: 'i1' })
    const getEvento = vi
      .fn()
      .mockResolvedValue({ cobra_inscricao: true, titulo: 'T' })
    const getCfg = vi.fn().mockResolvedValue({ confirma_inscricoes: false })
    const updatePedido = vi.fn()
    const pb = createPocketBaseMock()
    // pb. // [REMOVED] collection.mockImplementation((name: string) => {
      if (name === 'usuarios')
        return { getOne: getLider, getFirstListItem: getUser }
      if (name === 'inscricoes')
        return { getFirstListItem: getInscricao, create: createInscricao }
      if (name === 'eventos') return { getOne: getEvento }
      if (name === 'clientes_config') return { getFirstListItem: getCfg }
      if (name === 'pedidos') return { update: updatePedido, delete: vi.fn() }
      return {} as any
    })
    ;(
      requireClienteFromHost as unknown as {
        mockResolvedValue: (v: any) => void
      }
    ).mockResolvedValue({ pb, cliente: { nome: 'Cli', asaas_api_key: '$key' } })

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ pedidoId: 'p1', valor: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'link' }),
      })
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    global.fetch = fetchMock as unknown as typeof fetch

    const req = new Request('http://test/api/inscricoes', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'N',
        email: 'e@test.com',
        telefone: '111',
        cpf: '111',
        data_nascimento: '2000-01-01',
        genero: 'masculino',
        liderId: 'lid',
        eventoId: 'e1',
        paymentMethod: 'Credito',
      }),
    })
    ;(req as any).nextUrl = new URL('http://test/api/inscricoes')

    const pocketbaseModule = await // [REMOVED] PocketBase import
    ;(
      pocketbaseModule.default as unknown as {
        mockReturnValue: (v: any) => void
      }
    ).mockReturnValue(pb)

    const res = await postInscricoes(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(createInscricao).toHaveBeenCalledWith(
      expect.objectContaining({ paymentMethod: 'pix' }),
    )
    expect(
      JSON.parse(fetchMock.mock.calls[1][1].body as string).paymentMethod,
    ).toBe('pix')
  })

  it('normaliza na rota /api/asaas', async () => {
    const pb = createPocketBaseMock()
    // pb. // [REMOVED] collection.mockImplementation((name: string) => {
      if (name === 'pedidos')
        return {
          getOne: vi.fn().mockResolvedValue({
            id: 'p1',
            id_inscricao: 'ins1',
            produto: 'P',
            cliente: 'cli1',
            responsavel: 'u1',
          }),
          update: vi.fn(),
        }
      if (name === 'inscricoes')
        return {
          getOne: vi.fn().mockResolvedValue({
            id: 'ins1',
            cpf: '1',
            nome: 'N',
            email: 'e',
            telefone: '1',
            endereco: '',
            numero: '',
            cliente: 'cli1',
            criado_por: 'u1',
          }),
        }
      return {} as any
    })
    ;(
      requireClienteFromHost as unknown as {
        mockResolvedValue: (v: any) => void
      }
    ).mockResolvedValue({ pb, cliente: { nome: 'Cli', asaas_api_key: '$key' } })

    process.env.ASAAS_API_URL = 'http://asaas'
    const fetchMock = vi
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
        text: () => Promise.resolve('{"id":"pay","invoiceUrl":"url"}'),
      })
    global.fetch = fetchMock as unknown as typeof fetch

    const req = new Request('http://test/api/asaas', {
      method: 'POST',
      body: JSON.stringify({
        pedidoId: 'p1',
        valorBruto: 10,
        paymentMethod: 'Credito',
        installments: 1,
      }),
    })
    ;(req as any).nextUrl = new URL('http://test/api/asaas')

    const pocketbaseModule = await // [REMOVED] PocketBase import
    ;(
      pocketbaseModule.default as unknown as {
        mockReturnValue: (v: any) => void
      }
    ).mockReturnValue(pb)

    const res = await postAsaas(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = JSON.parse(
      (fetchMock.mock.calls[2][1] as RequestInit).body as string,
    )
    expect(body.billingType).toBe('PIX')
  })
})
