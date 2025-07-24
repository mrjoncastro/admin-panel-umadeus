import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProductRepository } from '../ProductRepository'
import { mockQueryWithRLS, mockProduct, mockProducts } from '../../test/mocks/database'

// Mock do módulo de conexão
vi.mock('../../database/connection', () => ({
  queryWithRLS: mockQueryWithRLS,
  query: vi.fn()
}))

describe('ProductRepository', () => {
  let productRepo: ProductRepository
  const tenantId = 'tenant-123'

  beforeEach(() => {
    productRepo = new ProductRepository()
    vi.clearAllMocks()
  })

  describe('findAll', () => {
    it('deve listar produtos com filtros padrão', async () => {
      mockQueryWithRLS.mockResolvedValue(mockProducts)

      const result = await productRepo.findAll(tenantId)

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        expect.stringContaining('SELECT * FROM produtos'),
        [20, 0]
      )
      expect(result).toEqual(mockProducts)
    })

    it('deve aplicar filtros corretamente', async () => {
      mockQueryWithRLS.mockResolvedValue(mockProducts)

      const filters = {
        page: 2,
        perPage: 10,
        ativo: true,
        categoria: 'cat-123',
        search: 'teste'
      }

      await productRepo.findAll(tenantId, filters)

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        expect.stringContaining('ativo = $1'),
        expect.arrayContaining([true, 'cat-123', '%teste%', 10, 10])
      )
    })
  })

  describe('findById', () => {
    it('deve encontrar produto por ID', async () => {
      mockQueryWithRLS.mockResolvedValue([mockProduct])

      const result = await productRepo.findById(tenantId, 'product-123')

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        'SELECT * FROM produtos WHERE id = $1',
        ['product-123']
      )
      expect(result).toEqual(mockProduct)
    })

    it('deve retornar null quando produto não encontrado', async () => {
      mockQueryWithRLS.mockResolvedValue([])

      const result = await productRepo.findById(tenantId, 'product-123')

      expect(result).toBeNull()
    })
  })

  describe('findBySlug', () => {
    it('deve encontrar produto por slug', async () => {
      mockQueryWithRLS.mockResolvedValue([mockProduct])

      const result = await productRepo.findBySlug(tenantId, 'produto-teste')

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        'SELECT * FROM produtos WHERE slug = $1',
        ['produto-teste']
      )
      expect(result).toEqual(mockProduct)
    })
  })

  describe('create', () => {
    it('deve criar produto com sucesso', async () => {
      const productData = {
        nome: 'Novo Produto',
        user_org: 'user-123',
        quantidade: 5,
        preco: 19.90,
        preco_bruto: 21.90,
        slug: 'novo-produto',
        cliente: tenantId
      }

      mockQueryWithRLS.mockResolvedValue([mockProduct])

      const result = await productRepo.create(tenantId, productData)

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        expect.stringContaining('INSERT INTO produtos'),
        expect.arrayContaining([
          'Novo Produto',
          'user-123',
          5,
          19.90,
          21.90,
          'novo-produto',
          tenantId
        ])
      )
      expect(result).toEqual(mockProduct)
    })
  })

  describe('update', () => {
    it('deve atualizar produto com sucesso', async () => {
      const updateData = {
        nome: 'Produto Atualizado',
        preco: 39.90
      }

      mockQueryWithRLS.mockResolvedValue([mockProduct])

      const result = await productRepo.update(tenantId, 'product-123', updateData)

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        expect.stringContaining('UPDATE produtos'),
        expect.arrayContaining(['Produto Atualizado', 39.90, 'product-123'])
      )
      expect(result).toEqual(mockProduct)
    })

    it('deve retornar produto existente quando não há dados para atualizar', async () => {
      mockQueryWithRLS.mockResolvedValue([mockProduct])

      const result = await productRepo.update(tenantId, 'product-123', {})

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        'SELECT * FROM produtos WHERE id = $1',
        ['product-123']
      )
      expect(result).toEqual(mockProduct)
    })
  })

  describe('delete', () => {
    it('deve deletar produto com sucesso', async () => {
      mockQueryWithRLS.mockResolvedValue([{ id: 'product-123' }])

      const result = await productRepo.delete(tenantId, 'product-123')

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        'DELETE FROM produtos WHERE id = $1',
        ['product-123']
      )
      expect(result).toBe(true)
    })

    it('deve retornar false quando produto não encontrado', async () => {
      mockQueryWithRLS.mockResolvedValue([])

      const result = await productRepo.delete(tenantId, 'product-123')

      expect(result).toBe(false)
    })
  })

  describe('count', () => {
    it('deve contar produtos corretamente', async () => {
      mockQueryWithRLS.mockResolvedValue([{ count: '5' }])

      const result = await productRepo.count(tenantId)

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        'SELECT COUNT(*) as count FROM produtos'
      )
      expect(result).toBe(5)
    })

    it('deve aplicar filtros na contagem', async () => {
      mockQueryWithRLS.mockResolvedValue([{ count: '3' }])

      const filters = { ativo: true, categoria: 'cat-123' }

      const result = await productRepo.count(tenantId, filters)

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        expect.stringContaining('ativo = $1'),
        [true, 'cat-123']
      )
      expect(result).toBe(3)
    })
  })

  describe('updateStock', () => {
    it('deve atualizar estoque com sucesso', async () => {
      mockQueryWithRLS.mockResolvedValue([mockProduct])

      const result = await productRepo.updateStock(tenantId, 'product-123', 2)

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        expect.stringContaining('UPDATE produtos'),
        [2, 'product-123']
      )
      expect(result).toEqual(mockProduct)
    })

    it('deve retornar null quando estoque insuficiente', async () => {
      mockQueryWithRLS.mockResolvedValue([])

      const result = await productRepo.updateStock(tenantId, 'product-123', 100)

      expect(result).toBeNull()
    })
  })
}) 