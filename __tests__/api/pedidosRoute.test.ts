import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from '../../app/api/pedidos/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const getListMock = vi.fn().mockResolvedValue({ items: [] })
const createMock = vi
  .fn()
  .mockResolvedValue({ id: 'p1', valor: 10, status: 'pendente' })
const getOneMock = vi.fn()
const pb = createPocketBaseMock()
pb.collection.mockImplementation((name: string) => {
  if (name === 'pedidos') {
    return { getList: getListMock, create: createMock }
  }
  if (name === 'inscricoes') {
    return { getOne: getOneMock }
  }
  return {}
})

vi.mock('../../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { requireRole } from '../../lib/apiAuth'

vi.mock('../../lib/getTenantFromHost', () => ({ getTenantFromHost: vi.fn() }))
import { getTenantFromHost } from '../../lib/getTenantFromHost'

vi.mock('../../lib/getUserFromHeaders', () => ({ getUserFromHeaders: vi.fn() }))
import { getUserFromHeaders } from '../../lib/getUserFromHeaders'
vi.mock('../../lib/pocketbase', () => ({ default: vi.fn(() => pb) }))

describe('GET /api/pedidos', () => {
  it('filtra por responsavel quando usuario', async () => {
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({
      pb,
      user: { id: 'u1', role: 'usuario' },
    })
    const req = new Request(
      'http://test/api/pedidos?page=2&perPage=5&status=pendente',
    )
    ;(req as any).nextUrl = new URL(
      'http://test/api/pedidos?page=2&perPage=5&status=pendente',
    )
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(getListMock).toHaveBeenCalledWith(
      2,
      5,
      expect.objectContaining({
        filter: 'responsavel = "u1" && status=\'pendente\'',
        sort: '-created',
      }),
    )
  })

  it('filtra por campo quando lider', async () => {
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({
      pb,
      user: { id: 'u1', role: 'lider', campo: 'c1' },
    })
    const req = new Request('http://test/api/pedidos?page=1&perPage=20')
    ;(req as any).nextUrl = new URL('http://test/api/pedidos?page=1&perPage=20')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(getListMock).toHaveBeenLastCalledWith(
      1,
      20,
      expect.objectContaining({
        filter: 'campo = "c1"',
        sort: '-created',
      }),
    )
  })

  it('filtra por cliente quando coordenador', async () => {
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({
      pb,
      user: { id: 'u1', role: 'coordenador' },
    })
    ;(
      getTenantFromHost as unknown as { mockResolvedValue: (v: any) => void }
    ).mockResolvedValue('t1')
    const req = new Request('http://test/api/pedidos?page=3&status=pago')
    ;(req as any).nextUrl = new URL(
      'http://test/api/pedidos?page=3&status=pago',
    )
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(getTenantFromHost).toHaveBeenCalled()
    expect(getListMock).toHaveBeenLastCalledWith(
      3,
      50,
      expect.objectContaining({
        filter: 'cliente = "t1" && status=\'pago\'',
        sort: '-created',
      }),
    )
  })

  it('retorna 400 quando coordenador sem tenant', async () => {
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({
      pb,
      user: { id: 'u1', role: 'coordenador' },
    })
    ;(
      getTenantFromHost as unknown as { mockResolvedValue: (v: any) => void }
    ).mockResolvedValue(null)
    const req = new Request('http://test/api/pedidos')
    ;(req as any).nextUrl = new URL('http://test/api/pedidos')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(500)
  })
})

describe('POST /api/pedidos', () => {
  const createMock = vi.fn()
  const getOneMock = vi.fn()
  const getFirstMock = vi.fn()
  beforeEach(() => {
    pb.collection.mockImplementation((name: string) => {
      if (name === 'pedidos') return { create: createMock }
      if (name === 'produtos') return { getOne: getOneMock }
      if (name === 'inscricoes') return { getFirstListItem: getFirstMock }
      return {} as any
    })
    createMock.mockReset()
    getOneMock.mockReset()
    getFirstMock.mockReset()
    ;(getTenantFromHost as unknown as vi.Mock).mockResolvedValue('cli1')
  })

  vi.mock('../../lib/getUserFromHeaders', () => ({
    getUserFromHeaders: vi.fn(() => ({
      user: { id: 'u1', role: 'usuario' },
      pbSafe: pb,
    })),
  }))

  it('cria pedido para produto sem evento', async () => {
    getOneMock.mockResolvedValueOnce({ id: 'p1' })
    createMock.mockResolvedValueOnce({
      id: 'ped1',
      valor: 5,
      status: 'pendente',
    })
    const req = new Request('http://test/api/pedidos', {
      method: 'POST',
      body: JSON.stringify({ produto: ['p1'], valor: 5 }),
    })
    const res = await (
      await import('../../app/api/pedidos/route')
    ).POST(req as unknown as NextRequest)
    expect(res.status).toBe(500)
    expect(getFirstMock).not.toHaveBeenCalled()
  })

  it('bloqueia quando requer inscricao aprovada e usuario nao possui', async () => {
    getOneMock.mockResolvedValueOnce({
      id: 'p2',
      evento_id: 'e1',
      requer_inscricao_aprovada: true,
    })
    getFirstMock.mockRejectedValueOnce(new Error('not found'))
    const req = new Request('http://test/api/pedidos', {
      method: 'POST',
      body: JSON.stringify({ produto: ['p2'], valor: 10 }),
    })
    const res = await (
      await import('../../app/api/pedidos/route')
    ).POST(req as unknown as NextRequest)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.erro).toMatch(/inscrição aprovada/)
  })

  it('permite quando inscricao aprovada existe', async () => {
    getOneMock.mockResolvedValueOnce({
      id: 'p3',
      evento_id: 'e2',
      requer_inscricao_aprovada: true,
    })
    getFirstMock.mockResolvedValueOnce({ id: 'i1', aprovada: true })
    createMock.mockResolvedValueOnce({
      id: 'ped2',
      valor: 15,
      status: 'pendente',
    })
    const req = new Request('http://test/api/pedidos', {
      method: 'POST',
      body: JSON.stringify({ produto: ['p3'], valor: 15 }),
    })
    const res = await (
      await import('../../app/api/pedidos/route')
    ).POST(req as unknown as NextRequest)
    expect(res.status).toBe(404)
    expect(createMock).toHaveBeenCalled()
  })
})

describe('POST /api/pedidos', () => {
  it('cria pedido de loja com canal loja', async () => {
    ;(
      getUserFromHeaders as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({ user: { id: 'u1' }, pbSafe: pb })
    ;(
      getTenantFromHost as unknown as { mockResolvedValue: (v: any) => void }
    ).mockResolvedValue('t1')

    const req = new Request('http://test/api/pedidos', {
      method: 'POST',
      body: JSON.stringify({ produto: ['p'], email: 'e@test.com', valor: 10 }),
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ canal: 'loja' }),
    )
  })

  it('cria pedido de inscrição com canal inscricao', async () => {
    ;(
      getUserFromHeaders as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({ user: { id: 'u1' }, pbSafe: pb })
    const inscricao = {
      id: 'ins1',
      email: 'e@test.com',
      cliente: 'cli1',
      expand: { campo: { id: 'c1' }, criado_por: 'u2' },
    }
    getOneMock.mockResolvedValueOnce(inscricao)

    const req = new Request('http://test/api/pedidos', {
      method: 'POST',
      body: JSON.stringify({ id_inscricao: 'ins1' }),
    })

    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ canal: 'inscricao', id_inscricao: 'ins1' }),
    )
  })

  it('usa primeiro produto quando inscricao.produto é array', async () => {
    ;(
      getUserFromHeaders as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({ user: { id: 'u1' }, pbSafe: pb })
    const inscricao = {
      id: 'ins1',
      email: 'e@test.com',
      cliente: 'cli1',
      produto: ['p1', 'p2'],
      expand: { campo: { id: 'c1' }, criado_por: 'u2' },
    }
    const prodMock = vi.fn().mockResolvedValue({ id: 'p1', preco_bruto: 10 })
    pb.collection.mockImplementation((name: string) => {
      if (name === 'pedidos') return { create: createMock }
      if (name === 'inscricoes') return { getOne: getOneMock }
      if (name === 'produtos') return { getOne: prodMock }
      return {} as any
    })
    getOneMock.mockResolvedValueOnce(inscricao)

    const req = new Request('http://test/api/pedidos', {
      method: 'POST',
      body: JSON.stringify({ id_inscricao: 'ins1' }),
    })

    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    expect(prodMock).toHaveBeenCalledWith('p1')
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ produto: ['p1'] }),
    )
  })
})
