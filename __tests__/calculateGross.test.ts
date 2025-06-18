import { describe, it, expect } from 'vitest'
import { calculateGross } from '../lib/asaasFees'

describe('calculateGross', () => {
  it('calcula valor para pix', () => {
    const { gross, margin } = calculateGross(50, 'pix', 1)
    expect(gross).toBe(55.49)
    expect(margin).toBe(3.5)
  })
  it('calcula valor para credito 3x', () => {
    const { gross } = calculateGross(50, 'credito', 3)
    expect(gross).toBeCloseTo(56.06, 2)
  })
})
