import { describe, it, expect } from 'vitest'
import { formatDate } from '../utils/formatDate'

describe('formatDate', () => {
  it('retorna a data formatada quando valor é válido', () => {
    const formatted = formatDate(new Date('2024-01-01'))
    expect(formatted).toBe('01/01/2024')
  })

  it('retorna string vazia quando valor é inválido', () => {
    const formatted = formatDate('invalid-date')
    expect(formatted).toBe('')
  })
})
