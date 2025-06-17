import { describe, it, expect } from 'vitest'
import { isValidCPF, isValidCNPJ, isValidDate } from '../utils/validators'

describe('isValidCPF', () => {
  it('valida cpfs corretos', () => {
    expect(isValidCPF('935.411.347-80')).toBe(true)
    expect(isValidCPF('93541134780')).toBe(true)
  })
  it('retorna false para cpf invalido', () => {
    expect(isValidCPF('11111111111')).toBe(false)
    expect(isValidCPF('123')).toBe(false)
  })
})

describe('isValidCNPJ', () => {
  it('valida cnpjs corretos', () => {
    expect(isValidCNPJ('51.174.497/0001-93')).toBe(true)
    expect(isValidCNPJ('51174497000193')).toBe(true)
  })
  it('retorna false para cnpj invalido', () => {
    expect(isValidCNPJ('11.111.111/1111-11')).toBe(false)
    expect(isValidCNPJ('123')).toBe(false)
  })
})

describe('isValidDate', () => {
  it('valida datas no formato yyyy-mm-dd', () => {
    expect(isValidDate('2023-01-01')).toBe(true)
  })
  it('retorna false para datas invalidas', () => {
    expect(isValidDate('2023-13-01')).toBe(false)
    expect(isValidDate('not a date')).toBe(false)
  })
})
