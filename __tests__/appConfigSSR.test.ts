import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { AppConfigProvider } from '../lib/context/AppConfigContext'

describe('AppConfigProvider SSR', () => {
  it('renders without crashing in a server environment', () => {
    const render = () =>
      renderToString(
        require('react').createElement(
          AppConfigProvider,
          null,
          require('react').createElement('div', null, 'SSR')
        )
      )
    expect(render).not.toThrow()
  })
})
