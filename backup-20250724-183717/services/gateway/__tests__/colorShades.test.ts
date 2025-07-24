import { describe, it, expect } from 'vitest'
import { hexToHsl, generateHslShades } from '@utils/colorShades'

describe('colorShades utilities', () => {
  it('converts hex to hsl correctly', () => {
    expect(hexToHsl('#ff0000')).toEqual([0, 100, 50])
    expect(hexToHsl('#fff')).toEqual([0, 0, 100])
  })

  it('generates hsl shades based on color', () => {
    const shades = generateHslShades('#ffffff')
    expect(shades['600']).toBe('0 0% 100%')
    expect(Object.keys(shades)).toContain('900')
  })
})
