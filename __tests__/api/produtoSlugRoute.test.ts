import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/produtos/[slug]/route'
import { NextRequest } from 'next/server'

vi.mock('../../lib/pocketbase', () => ({
  default: vi.fn(() => ({
    collection: () => ({ getFirstListItem: vi.fn() }),
    files: { getURL: vi.fn() },
  })),
}))

vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: vi.fn().mockResolvedValue(null),
}))

describe('GET /api/produtos/[slug]', () => {
  it('retorna 400 quando tenant não informado', async () => {
    const req = new Request('http://test/produtos/p')
    ;(req as any).nextUrl = new URL('http://test/produtos/p')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Tenant não informado')
  })
})
