import * as React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { TenantProvider } from '../lib/context/TenantContext'

describe('TenantProvider SSR', () => {
  it('renders without crashing in a server environment', () => {
    const render = () =>
      renderToString(
        React.createElement(
          TenantProvider,
          null,
          React.createElement('div', null, 'SSR')
        )
      )
    expect(render).not.toThrow()
  })
})
