import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/admin/api/usuarios/[id]/route'
import { NextRequest } from 'next/server'

vi.mock('../../lib/apiAuth', () => ({ requireRole: vi.fn() }))
import { requireRole } from '../../lib/apiAuth'

vi.mock('../../lib/services/pocketbase', () => ({
  fetchUsuario: vi.fn()
}))
import { fetchUsuario } from '../../lib/services/pocketbase'

describe('GET /admin/api/usuarios/[id] multi-tenant', () => {
  it('nega acesso quando usuario pertence a outro tenant', async () => {
    (requireRole as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
      pb: {},
      user: { cliente: 't1' }
    })
    ;(fetchUsuario as unknown as { mockRejectedValueOnce: (v: any) => void }).mockRejectedValueOnce(new Error('TENANT_MISMATCH'))

    const req = new Request('http://test/admin/api/usuarios/u1')
    ;(req as any).nextUrl = new URL('http://test/admin/api/usuarios/u1')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(403)
  })

  it('retorna registro quando pertence ao tenant', async () => {
    (requireRole as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
      pb: {},
      user: { cliente: 't1' }
    })
    ;(fetchUsuario as unknown as { mockResolvedValueOnce: (v: any) => void }).mockResolvedValueOnce({ id: 'u1', cliente: 't1' })

    const req = new Request('http://test/admin/api/usuarios/u1')
    ;(req as any).nextUrl = new URL('http://test/admin/api/usuarios/u1')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('u1')
  })
})
