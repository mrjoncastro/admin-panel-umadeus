// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { act } from 'react-dom/test-utils'
import * as ReactDOM from 'react-dom/client'
import { useAuth } from '../../lib/hooks/useAuth'

// mock usePocketBase to provide a controllable authStore
const listeners: Array<() => void> = []
const pb = {
  authStore: {
    isValid: false,
    model: null as unknown,
    token: null as string | null,
    onChange: vi.fn((cb: () => void) => {
      listeners.push(cb)
      return () => {}
    }),
    clear: vi.fn()
  }
}
function trigger() {
  listeners.forEach(fn => fn())
}
vi.mock('../../lib/hooks/usePocketBase', () => ({ default: () => pb }))

function renderHook<T>(callback: () => T) {
  let result: T
  const container = document.createElement('div')
  const root = ReactDOM.createRoot(container)
  function TestComponent() {
    result = callback()
    return null
  }
  act(() => {
    root.render(<TestComponent />)
  })
  return { get result() { return result! }, rerender: () => act(() => root.render(<TestComponent />)) }
}

describe('useAuth', () => {
  it('atualiza estado quando authStore muda', () => {
    pb.authStore.isValid = true
    pb.authStore.model = { id: '1', role: 'coordenador' }
    pb.authStore.token = 'tok'

    const hook = renderHook(() => useAuth())
    expect(hook.result.user).toEqual(pb.authStore.model)
    expect(hook.result.token).toBe('tok')
    expect(hook.result.isLoggedIn).toBe(true)

    pb.authStore.model = { id: '2', role: 'lider' }
    pb.authStore.token = 'novo'
    act(() => trigger())

    expect(hook.result.user).toEqual(pb.authStore.model)
    expect(hook.result.token).toBe('novo')
  })
})
