import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/tenant/route'

vi.mock('../../lib/getTenantFromHost', () => ({
  getTenantFromHost: vi.fn().mockResolvedValue(null),
}))

describe('GET /api/tenant', () => {
  it('retorna 404 quando domínio não configurado', async () => {
    const res = await GET()
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Domínio não configurado')
  })
})
