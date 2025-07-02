import { describe, it, expect } from 'vitest'
import { calculateGross } from '../lib/asaasFees'

describe('calculateGross', () => {
  it('calcula valor para pix', () => {
    const { gross, margin } = calculateGross(50, 'pix', 1)
    expect(gross).toBe(55.49)
    expect(margin).toBe(3.5)
  })
  it('valor do credito nunca inferior ao pix', () => {
    const pixGross = calculateGross(50, 'pix', 1).gross

    const credito1 = calculateGross(50, 'credito', 1).gross
    expect(credito1).toBeGreaterThanOrEqual(pixGross)

    const credito3 = calculateGross(50, 'credito', 3).gross
    expect(credito3).toBeGreaterThanOrEqual(pixGross)
  })
})
