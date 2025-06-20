import { describe, it, expect } from 'vitest'
import { filtrarProdutos, ProdutoRecord } from '../lib/products'

const produtos: ProdutoRecord[] = [
  { id: '1', nome: 'A', preco: 10, ativo: true, categoria: 'roupas' },
  { id: '2', nome: 'B', preco: 20, ativo: false, categoria: 'roupas' },
  { id: '3', nome: 'C', preco: 30, ativo: true, categoria: 'acessorios' },
]

describe('filtrarProdutos', () => {
  it('remove produtos inativos', () => {
    const filtrados = filtrarProdutos(produtos)
    expect(filtrados).toHaveLength(2)
    expect(filtrados.find((p) => p.id === '2')).toBeUndefined()
  })

  it('filtra por categoria quando informada', () => {
    const filtrados = filtrarProdutos(produtos, 'roupas')
    expect(filtrados).toHaveLength(1)
    expect(filtrados[0].id).toBe('1')
  })
})
