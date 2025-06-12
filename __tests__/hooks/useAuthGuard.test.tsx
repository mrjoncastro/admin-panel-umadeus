// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { act } from 'react-dom/test-utils'
import * as ReactDOM from 'react-dom/client'
import { useAuthGuard } from '../../lib/hooks/useAuthGuard'

const router = { replace: vi.fn() }
vi.mock('next/navigation', () => ({ useRouter: () => router }))

const pb = {
  authStore: { clear: vi.fn() }
}

vi.mock('../../lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser, isLoggedIn: loggedIn, pb })
}))

let mockUser: { role: string } | null = null
let loggedIn = false

function renderHook<T>(cb: () => T) {
  let result: T
  const container = document.createElement('div')
  const root = ReactDOM.createRoot(container)
  function Comp() {
    result = cb()
    return null
  }
  act(() => {
    root.render(<Comp />)
  })
  return { get result() { return result! }, rerender: () => act(() => root.render(<Comp />)) }
}

describe('useAuthGuard', () => {
  it('redireciona quando sem permissao', () => {
    mockUser = { role: 'usuario' }
    loggedIn = true
    const hook = renderHook(() => useAuthGuard(['coordenador']))
    expect(pb.authStore.clear).toHaveBeenCalled()
    expect(router.replace).toHaveBeenCalledWith('/login')
    expect(hook.result.authChecked).toBe(false)
  })

  it('permite acesso quando papel permitido', () => {
    router.replace.mockClear()
    pb.authStore.clear.mockClear()
    mockUser = { role: 'coordenador' }
    loggedIn = true
    const hook = renderHook(() => useAuthGuard(['coordenador']))
    expect(pb.authStore.clear).not.toHaveBeenCalled()
    expect(router.replace).not.toHaveBeenCalled()
    expect(hook.result.authChecked).toBe(true)
  })
})
