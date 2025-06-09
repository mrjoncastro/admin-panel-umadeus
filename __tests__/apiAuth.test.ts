import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireRole } from '../lib/apiAuth'
import type { RecordModel } from 'pocketbase'

let mockGetUserFromHeaders: ReturnType<typeof vi.fn>
vi.mock('../lib/getUserFromHeaders', () => ({
  getUserFromHeaders: (...args: unknown[]) => mockGetUserFromHeaders(...args)
}))
mockGetUserFromHeaders = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('requireRole', () => {
  it('propaga erro de autenticacao', () => {
    mockGetUserFromHeaders.mockReturnValue({ error: 'fail' })
    const result = requireRole({} as any, 'admin')
    expect(result).toEqual({ error: 'fail', status: 401 })
  })

  it('nega acesso para role incorreta', () => {
    const user = { role: 'user' } as RecordModel
    mockGetUserFromHeaders.mockReturnValue({ user, pbSafe: {} })
    const result = requireRole({} as any, 'admin')
    expect(result).toEqual({ error: 'Acesso negado', status: 403 })
  })

  it('permite acesso quando role correta', () => {
    const pb = {}
    const user = { role: 'admin' } as RecordModel
    mockGetUserFromHeaders.mockReturnValue({ user, pbSafe: pb })
    const result = requireRole({} as any, 'admin')
    expect(result).toEqual({ user, pb })
  })
})
