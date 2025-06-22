import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import createPocketBaseMock from './mocks/pocketbase'

const pb = createPocketBaseMock()
vi.mock('../lib/pocketbase', () => ({ default: vi.fn(() => pb) }))

import { middleware } from '../middleware'

let getFirstListItemMock: any

beforeEach(() => {
  getFirstListItemMock = vi.fn().mockResolvedValue({ cliente: 'cli1' })
  pb.collection.mockReturnValue({ getFirstListItem: getFirstListItemMock })
})

describe('middleware', () => {
  it('adiciona cabecalho x-tenant-id e reescreve cookie tenantId', async () => {
    const req = new NextRequest('http://tenant.com/test', {
      headers: { host: 'tenant.com', cookie: 'tenantId=old' },
    })
    const res = await middleware(req)
    expect(res.headers.get('x-tenant-id')).toBe('cli1')
    expect(res.headers.get('set-cookie')).toContain('tenantId=cli1')
  })
})
