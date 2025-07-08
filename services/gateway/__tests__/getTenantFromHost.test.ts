import { describe, it, expect, beforeEach, vi } from 'vitest'

import createPocketBaseMock from './mocks/pocketbase'

let headersData: Record<string, string>
let cookieStore: Record<string, string>

vi.mock('next/headers', () => ({
  headers: () => new Headers(headersData),
  cookies: () => ({
    get: (name: string) =>
      cookieStore[name] ? { name, value: cookieStore[name] } : undefined,
    set: (name: string, value: string) => {
      cookieStore[name] = value
    },
  }),
}))

const pb = createPocketBaseMock()
let getFirstListItemMock: any

vi.mock('../lib/pocketbase', () => ({
  default: vi.fn(() => pb),
}))

import { getTenantFromHost } from '../lib/getTenantFromHost'

beforeEach(() => {
  headersData = { host: 'dom.com' }
  cookieStore = { tenantId: 'old' }
  getFirstListItemMock = vi.fn().mockResolvedValue({ cliente: 'new' })
  pb.collection.mockReturnValue({ getFirstListItem: getFirstListItemMock })
})

describe('getTenantFromHost', () => {
  it('atualiza cookie quando domínio retorna tenant diferente', async () => {
    const tenant = await getTenantFromHost()
    expect(tenant).toBe('new')
    expect(cookieStore.tenantId).toBe('new')
  })

  it('usa cookie quando domínio não encontrado', async () => {
    getFirstListItemMock.mockRejectedValue(new Error('fail'))
    const tenant = await getTenantFromHost()
    expect(tenant).toBe('old')
    expect(cookieStore.tenantId).toBe('old')
  })
})
