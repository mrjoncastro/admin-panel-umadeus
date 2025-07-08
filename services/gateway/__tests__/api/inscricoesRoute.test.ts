import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/inscricoes/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const getListMock = vi.fn().mockResolvedValue({
  items: [],
  page: 1,
  perPage: 1,
  totalPages: 1,
  totalItems: 0,
})
const pb = createPocketBaseMock()
pb.collection.mockReturnValue({ getList: getListMock })

vi.mock('../../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { requireRole } from '../../lib/apiAuth'

vi.mock('../../lib/getTenantFromHost', () => ({ getTenantFromHost: vi.fn() }))
import { getTenantFromHost } from '../../lib/getTenantFromHost'

describe('GET /api/inscricoes', () => {
  it('filtra por criado_por quando usuario', async () => {
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({
      pb,
      user: { id: 'u1', role: 'usuario' },
    })
    const req = new Request(
      'http://test/api/inscricoes?page=1&perPage=5&status=pendente',
    )
    ;(req as any).nextUrl = new URL(
      'http://test/api/inscricoes?page=1&perPage=5&status=pendente',
    )
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('totalItems')
    expect(getListMock).toHaveBeenCalledWith(
      1,
      5,
      expect.objectContaining({
        filter: 'criado_por = "u1" && status=\'pendente\'',
        expand: 'evento,campo,pedido,produto',
        sort: '-created',
      }),
    )
  })

  it('filtra por evento quando informado', async () => {
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({
      pb,
      user: { id: 'u1', role: 'usuario' },
    })
    const req = new Request(
      'http://test/api/inscricoes?status=pendente&evento=ev1',
    )
    ;(req as any).nextUrl = new URL(
      'http://test/api/inscricoes?status=pendente&evento=ev1',
    )
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    await res.json()
    expect(getListMock).toHaveBeenLastCalledWith(
      1,
      50,
      expect.objectContaining({
        filter: "criado_por = \"u1\" && status='pendente' && evento='ev1'",
        expand: 'evento,campo,pedido,produto',
        sort: '-created',
      }),
    )
  })

  it('usa page da URL quando informado', async () => {
    ;(
      requireRole as unknown as { mockReturnValue: (v: any) => void }
    ).mockReturnValue({
      pb,
      user: { id: 'u1', role: 'usuario' },
    })
    const req = new Request('http://test/api/inscricoes?page=2&perPage=5')
    ;(req as any).nextUrl = new URL(
      'http://test/api/inscricoes?page=2&perPage=5',
    )
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    await res.json()
    expect(getListMock).toHaveBeenLastCalledWith(
      2,
      5,
      expect.objectContaining({
        filter: 'criado_por = "u1"',
        expand: 'evento,campo,pedido,produto',
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
    const req = new Request('http://test/api/inscricoes?page=1&perPage=20')
    ;(req as any).nextUrl = new URL(
      'http://test/api/inscricoes?page=1&perPage=20',
    )
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('totalItems')
    expect(getListMock).toHaveBeenLastCalledWith(
      1,
      20,
      expect.objectContaining({
        filter: 'campo = "c1"',
        expand: 'evento,campo,pedido,produto',
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
    const req = new Request('http://test/api/inscricoes?page=1&status=ativo')
    ;(req as any).nextUrl = new URL(
      'http://test/api/inscricoes?page=1&status=ativo',
    )
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('totalItems')
    expect(getTenantFromHost).toHaveBeenCalled()
    expect(getListMock).toHaveBeenLastCalledWith(
      1,
      50,
      expect.objectContaining({
        filter: 'cliente = "t1" && status=\'ativo\'',
        expand: 'evento,campo,pedido,produto',
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
    const req = new Request('http://test/api/inscricoes?page=1')
    ;(req as any).nextUrl = new URL('http://test/api/inscricoes?page=1')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(400)
  })
})
