import { vi } from 'vitest'

export default function createPocketBaseMock() {
  return {
    collection: vi.fn(() => ({
      create: vi.fn(),
      update: vi.fn(),
      getFullList: vi.fn(),
      getList: vi.fn(),
      getOne: vi.fn(),
      getFirstListItem: vi.fn(),
    })),
    files: { getURL: vi.fn() },
    admins: { authWithPassword: vi.fn() },
    authStore: { save: vi.fn(), clear: vi.fn(), isValid: true },
  }
}
