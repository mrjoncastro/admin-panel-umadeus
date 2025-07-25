import { describe, it, expect, vi } from 'vitest'
import { POST } from '../../app/api/inscricoes/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const getOneLiderMock = vi.fn().mockResolvedValue({
  expand: { campo: { id: 'c1' } },
  cliente: 'cli1',
})
const getFirstUserMock = vi.fn().mockResolvedValue({ id: 'u1' })
const createUserMock = vi.fn()
const getFirstInscricaoMock = vi
  .fn()
  .mockRejectedValueOnce(new Error('not found'))
  .mockResolvedValueOnce({ id: 'i1' })
const createInscricaoMock = vi.fn()

const pb = createPocketBaseMock()
pb.collection.mockImplementation((name: string) => {
  if (name === 'usuarios') {
    return {
      getOne: getOneLiderMock,
      getFirstListItem: getFirstUserMock,
      create: createUserMock,
    }
  }
  if (name === 'inscricoes') {
    return {
      getFirstListItem: getFirstInscricaoMock,
      create: createInscricaoMock,
    }
  }
  return {} as any
})

vi.mock('../../lib/pocketbase', () => ({ default: vi.fn(() => pb) }))

describe('POST /api/inscricoes', () => {
  it('retorna 409 quando usuario ja inscrito no evento', async () => {
    const req = new Request('http://test/api/inscricoes', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'N',
        email: 'e@test.com',
        telefone: '11999999999',
        cpf: '11111111111',
        data_nascimento: '2000-01-01',
        genero: 'masculino',
        liderId: 'lid1',
        eventoId: 'ev1',
      }),
    })
    ;(req as any).nextUrl = new URL('http://test/api/inscricoes')

    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.erro).toBe('Usuário já inscrito neste evento')
    expect(createInscricaoMock).not.toHaveBeenCalled()
  })

  it('cria inscricao quando dados validos', async () => {
    getFirstInscricaoMock.mockReset()
    getFirstInscricaoMock.mockRejectedValueOnce(new Error('not found'))
    createInscricaoMock.mockResolvedValueOnce({ id: 'i2' })
    const req = new Request('http://test/api/inscricoes', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Fulano',
        email: 'e@test.com',
        telefone: '11999999999',
        cpf: '11111111111',
        data_nascimento: '2000-01-01',
        genero: 'masculino',
        liderId: 'lid1',
        eventoId: 'ev1',
        produtoId: 'p1',
        tamanho: 'M',
        paymentMethod: 'pix',
      }),
    })
    ;(req as any).nextUrl = new URL('http://test/api/inscricoes')

    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(201)
    expect(createInscricaoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        evento: 'ev1',
        campo: 'c1',
        produto: 'p1',
        tamanho: 'M',
        paymentMethod: 'pix',
      }),
    )
  })

  it('gera pedido automaticamente quando o proprio lider se inscreve', async () => {
    const updateInscricao = vi.fn()
    const pbLocal = createPocketBaseMock()
    pbLocal.authStore.model = { id: 'lid1' }
    pbLocal.collection.mockImplementation((name: string) => {
      if (name === 'usuarios') {
        return {
          getOne: getOneLiderMock,
          getFirstListItem: getFirstUserMock,
          create: createUserMock,
        }
      }
      if (name === 'inscricoes') {
        return {
          getFirstListItem: vi.fn().mockRejectedValue(new Error('not found')),
          create: vi.fn().mockResolvedValue({ id: 'i2' }),
          update: updateInscricao,
        }
      }
      if (name === 'eventos')
        return {
          getOne: vi
            .fn()
            .mockResolvedValue({ cobra_inscricao: true, titulo: 'T' }),
        }
      if (name === 'clientes_config')
        return {
          getFirstListItem: vi
            .fn()
            .mockResolvedValue({ confirma_inscricoes: true }),
        }
      if (name === 'pedidos') return { update: vi.fn(), delete: vi.fn() }
      return {} as any
    })

    const pocketbaseModule = await import('../../lib/pocketbase')
    ;(
      pocketbaseModule.default as unknown as {
        mockReturnValue: (v: any) => void
      }
    ).mockReturnValue(pbLocal)

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ pedidoId: 'p1', valor: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'link', id_asaas: 'a1' }),
      })
    global.fetch = fetchMock as unknown as typeof fetch

    const req = new Request('http://test/api/inscricoes', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Lider',
        email: 'lider@test.com',
        telefone: '11999999999',
        cpf: '11111111111',
        data_nascimento: '2000-01-01',
        genero: 'masculino',
        liderId: 'lid1',
        eventoId: 'ev1',
      }),
    })
    ;(req as any).nextUrl = new URL('http://test/api/inscricoes')

    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(201)
    expect(updateInscricao).toHaveBeenCalledWith(
      'i2',
      expect.objectContaining({ status: 'aguardando_pagamento' }),
    )
  })

  it('mantem pendente para outros usuarios quando confirma_inscricoes ativo', async () => {
    const updateInscricao = vi.fn()
    const pbLocal = createPocketBaseMock()
    pbLocal.authStore.model = { id: 'other' }
    pbLocal.collection.mockImplementation((name: string) => {
      if (name === 'usuarios') {
        return {
          getOne: getOneLiderMock,
          getFirstListItem: getFirstUserMock,
          create: createUserMock,
        }
      }
      if (name === 'inscricoes') {
        return {
          getFirstListItem: vi.fn().mockRejectedValue(new Error('not found')),
          create: vi.fn().mockResolvedValue({ id: 'i3' }),
          update: updateInscricao,
        }
      }
      if (name === 'eventos')
        return {
          getOne: vi
            .fn()
            .mockResolvedValue({ cobra_inscricao: true, titulo: 'T' }),
        }
      if (name === 'clientes_config')
        return {
          getFirstListItem: vi
            .fn()
            .mockResolvedValue({ confirma_inscricoes: true }),
        }
      return {} as any
    })

    const pocketbaseModule = await import('../../lib/pocketbase')
    ;(
      pocketbaseModule.default as unknown as {
        mockReturnValue: (v: any) => void
      }
    ).mockReturnValue(pbLocal)

    global.fetch = vi.fn() as unknown as typeof fetch

    const req = new Request('http://test/api/inscricoes', {
      method: 'POST',
      body: JSON.stringify({
        nome: 'User',
        email: 'u@test.com',
        telefone: '11999999999',
        cpf: '11111111111',
        data_nascimento: '2000-01-01',
        genero: 'masculino',
        liderId: 'lid1',
        eventoId: 'ev1',
      }),
    })
    ;(req as any).nextUrl = new URL('http://test/api/inscricoes')

    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(201)
    expect(updateInscricao).not.toHaveBeenCalled()
  })
})
