// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { act } from 'react-dom/test-utils'
import * as ReactDOM from 'react-dom/client'
import usePocketBase from '../../lib/hooks/usePocketBase'

const pb = {}
const createPocketBase = vi.fn(() => pb)
vi.mock('../../lib/pocketbase', () => ({ default: createPocketBase }))

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
  return { result: () => result!, rerender: () => act(() => root.render(<Comp />)) }
}

describe('usePocketBase', () => {
  it('memoiza instancia', () => {
    const hook = renderHook(() => usePocketBase())
    expect(hook.result()).toBe(pb)
    expect(createPocketBase).toHaveBeenCalledTimes(1)
    hook.rerender()
    expect(createPocketBase).toHaveBeenCalledTimes(1)
    expect(hook.result()).toBe(pb)
  })
})
