import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import * as headers from '../lib/getUserFromHeaders'
import { requireRole } from '../lib/apiAuth'

describe('requireRole', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna erro 401 quando usuario ausente', () => {
    vi.spyOn(headers, 'getUserFromHeaders').mockReturnValue({ error: 'fail' })
    const req = new Request('http://test')
    const res = requireRole(req as unknown as NextRequest, 'admin')
    expect(res).toEqual({ error: 'fail', status: 401 })
  })

  it('retorna 403 quando papel incorreto', () => {
    const pb = {}
    vi.spyOn(headers, 'getUserFromHeaders').mockReturnValue({
      user: { role: 'user' } as any,
      pbSafe: pb as any,
    })
    const req = new Request('http://test')
    const res = requireRole(req as unknown as NextRequest, 'admin')
    expect(res).toEqual({ error: 'Acesso negado', status: 403 })
  })

  it('retorna objeto RequireRoleOk quando papel correto', () => {
    const pb = { test: true }
    const user = { role: 'admin', id: 'u1' } as any
    vi.spyOn(headers, 'getUserFromHeaders').mockReturnValue({
      user,
      pbSafe: pb as any,
    })
    const req = new Request('http://test')
    const res = requireRole(req as unknown as NextRequest, 'admin')
    expect(res).toEqual({ user, pb })
  })
})
