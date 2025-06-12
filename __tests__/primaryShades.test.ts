import { describe, it, expect } from 'vitest'
import { hexToHsl, generatePrimaryShades } from '../utils/primaryShades'

describe('primaryShades utilities', () => {
  it('converts hex to hsl correctly', () => {
    expect(hexToHsl('#ff0000')).toEqual([0, 100, 50])
    expect(hexToHsl('#fff')).toEqual([0, 0, 100])
  })

  it('generates primary shades based on color', () => {
    const shades = generatePrimaryShades('#ff0000')
    expect(shades).toEqual({
      '50': '0 100% 92%',
      '100': '0 100% 82%',
      '200': '0 100% 74%',
      '300': '0 100% 66%',
      '400': '0 100% 58%',
      '500': '0 100% 54%',
      '600': '0 100% 50%',
      '700': '0 100% 42%',
      '800': '0 100% 34%',
      '900': '0 100% 26%',
    })
  })
})
