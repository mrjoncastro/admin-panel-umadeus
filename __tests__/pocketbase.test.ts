import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

function setupPocketBaseMock(withClone: boolean) {
  const instances: MockPocketBase[] = []
  class MockPocketBase {
    url: string
    authStore = {
      token: '',
      model: null as unknown,
      save: vi.fn((token: string, model: unknown) => {
        this.authStore.token = token
        this.authStore.model = model
      }),
      clear: vi.fn(() => {
        this.authStore.token = ''
        this.authStore.model = null
      }),
    }
    constructor(url: string) {
      this.url = url
      instances.push(this)
    }
    clone?: () => MockPocketBase
  }
  if (withClone) {
    MockPocketBase.prototype.clone = vi.fn(function (this: MockPocketBase) {
      return new MockPocketBase(this.url)
    })
  }
  vi.doMock('pocketbase', () => ({ default: MockPocketBase }))
  return { instances, MockPocketBase }
}

describe('pocketbase utilities', () => {
  const env = process.env
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...env, PB_URL: 'http://test' }
  })
  afterEach(() => {
    vi.restoreAllMocks()
    process.env = env
  })

  it('createPocketBase usa clone quando disponivel', async () => {
    const { instances } = setupPocketBaseMock(true)
    const { createPocketBase } = await import('../lib/pocketbase')
    const pb = createPocketBase()
    expect(instances).toHaveLength(2)
    expect(pb).toBe(instances[1])
    expect(instances[0].clone).toHaveBeenCalled()
  })

  it('sincroniza auth e atualiza base', async () => {
    const { instances } = setupPocketBaseMock(false)
    const { createPocketBase, updateBaseAuth, clearBaseAuth } = await import(
      '../lib/pocketbase'
    )

    updateBaseAuth('tok', { id: 'u1' })
    expect(instances[0].authStore.save).toHaveBeenCalledWith('tok', {
      id: 'u1',
    })
    expect(instances[0].authStore.token).toBe('tok')

    const pb = createPocketBase()
    expect(pb.authStore.save).toHaveBeenCalledWith('tok', { id: 'u1' })

    clearBaseAuth()
    expect(instances[0].authStore.clear).toHaveBeenCalled()
    expect(instances[0].authStore.token).toBe('')
  })
})
