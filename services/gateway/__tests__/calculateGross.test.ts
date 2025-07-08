import { describe, it, expect } from 'vitest'
import { calculateGross } from '../lib/asaasFees'

describe('calculateGross', () => {
  it('calcula valor para pix', () => {
    const { gross, margin } = calculateGross(50, 'pix', 1)
    expect(gross).toBe(55.49)
    expect(margin).toBe(3.5)
  })
})
