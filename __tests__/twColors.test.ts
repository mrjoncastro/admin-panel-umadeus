import { describe, it, expect } from 'vitest'
import twColors from '../utils/twColors'

describe('twColors utility', () => {
  it('reads colors from tailwind config', () => {
    expect(twColors.primary600).toBe('hsl(var(--primary-600))')
    expect(twColors.error600).toBe('#dc2626')
  })

  it('exposes tailwindcss blue color', () => {
    expect(twColors.blue500).toBe('#3b82f6')
  })
})
