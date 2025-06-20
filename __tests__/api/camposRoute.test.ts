import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/campos/route'
import { NextRequest } from 'next/server'
import createPocketBaseMock from '../mocks/pocketbase'

const getFullListMock = vi.fn().mockResolvedValue([{ id: '1', nome: 'Campo' }])
const pb = createPocketBaseMock()
pb.collection.mockReturnValue({ getFullList: getFullListMock })
vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => pb),
}))

vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: vi.fn().mockResolvedValue(null),
}))

describe('GET /api/campos', () => {
  it('retorna 400 quando tenant não informado', async () => {
    const req = new Request('http://test')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Tenant não informado')
  })
})
