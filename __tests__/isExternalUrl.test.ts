import { describe, it, expect } from 'vitest'
import { isExternalUrl } from '../utils/isExternalUrl'

describe('isExternalUrl', () => {
  it('detects http and https urls', () => {
    expect(isExternalUrl('https://example.com')).toBe(true)
    expect(isExternalUrl('http://example.com')).toBe(true)
  })

  it('returns false for relative urls', () => {
    expect(isExternalUrl('/about')).toBe(false)
    expect(isExternalUrl('mailto:test@example.com')).toBe(false)
  })
})
