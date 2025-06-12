import { describe, it, expect } from 'vitest'
import { hexToPtName } from '../utils/colorNamePt'

describe('hexToPtName', () => {
  it('converte cores basicas corretamente', () => {
    expect(hexToPtName('#ff0000')).toBe('vermelho')
    expect(hexToPtName('#00ff00')).toBe('verde')
    expect(hexToPtName('#0000ff')).toBe('azul')
  })

  it('retorna string original para valor invalido', () => {
    expect(hexToPtName('gibberish')).toBe('gibberish')
  })

  it('retorna vazio para string vazia', () => {
    expect(hexToPtName('')).toBe('')
  })
})
