import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CategoryRepository } from '../CategoryRepository'
import { mockQueryWithRLS, mockCategory, mockCategories } from '../../test/mocks/database'

// Mock do módulo de conexão
vi.mock('../../database/connection', () => ({
  queryWithRLS: mockQueryWithRLS,
  query: vi.fn()
}))

describe('CategoryRepository', () => {
  let categoryRepo: CategoryRepository
  const tenantId = 'tenant-123'

  beforeEach(() => {
    categoryRepo = new CategoryRepository()
    vi.clearAllMocks()
  })

  describe('findAll', () => {
    it('deve listar categorias ordenadas por nome', async () => {
      mockQueryWithRLS.mockResolvedValue(mockCategories)

      const result = await categoryRepo.findAll(tenantId)

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        'SELECT * FROM categorias ORDER BY nome ASC'
      )
      expect(result).toEqual(mockCategories)
    })
  })

  describe('findById', () => {
    it('deve encontrar categoria por ID', async () => {
      mockQueryWithRLS.mockResolvedValue([mockCategory])

      const result = await categoryRepo.findById(tenantId, 'cat-123')

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        'SELECT * FROM categorias WHERE id = $1',
        ['cat-123']
      )
      expect(result).toEqual(mockCategory)
    })

    it('deve retornar null quando categoria não encontrada', async () => {
      mockQueryWithRLS.mockResolvedValue([])

      const result = await categoryRepo.findById(tenantId, 'cat-123')

      expect(result).toBeNull()
    })
  })

  describe('findBySlug', () => {
    it('deve encontrar categoria por slug', async () => {
      mockQueryWithRLS.mockResolvedValue([mockCategory])

      const result = await categoryRepo.findBySlug(tenantId, 'categoria-teste')

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        'SELECT * FROM categorias WHERE slug = $1',
        ['categoria-teste']
      )
      expect(result).toEqual(mockCategory)
    })
  })

  describe('create', () => {
    it('deve criar categoria com sucesso', async () => {
      const categoryData = {
        nome: 'Nova Categoria',
        slug: 'nova-categoria',
        cliente: tenantId
      }

      mockQueryWithRLS.mockResolvedValue([mockCategory])

      const result = await categoryRepo.create(tenantId, categoryData)

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        'INSERT INTO categorias (nome, slug, cliente) VALUES ($1, $2, $3) RETURNING *',
        ['Nova Categoria', 'nova-categoria', tenantId]
      )
      expect(result).toEqual(mockCategory)
    })
  })

  describe('update', () => {
    it('deve atualizar categoria com sucesso', async () => {
      const updateData = {
        nome: 'Categoria Atualizada',
        slug: 'categoria-atualizada'
      }

      mockQueryWithRLS.mockResolvedValue([mockCategory])

      const result = await categoryRepo.update(tenantId, 'cat-123', updateData)

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        expect.stringContaining('UPDATE categorias'),
        expect.arrayContaining(['Categoria Atualizada', 'categoria-atualizada', 'cat-123'])
      )
      expect(result).toEqual(mockCategory)
    })

    it('deve retornar categoria existente quando não há dados para atualizar', async () => {
      mockQueryWithRLS.mockResolvedValue([mockCategory])

      const result = await categoryRepo.update(tenantId, 'cat-123', {})

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        'SELECT * FROM categorias WHERE id = $1',
        ['cat-123']
      )
      expect(result).toEqual(mockCategory)
    })
  })

  describe('delete', () => {
    it('deve deletar categoria com sucesso quando não há produtos associados', async () => {
      // Mock para verificação de produtos associados
      mockQueryWithRLS
        .mockResolvedValueOnce([{ count: '0' }]) // Nenhum produto associado
        .mockResolvedValueOnce([{ id: 'cat-123' }]) // Deletar categoria

      const result = await categoryRepo.delete(tenantId, 'cat-123')

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        'SELECT COUNT(*) as count FROM produtos WHERE categoria = $1',
        ['cat-123']
      )
      expect(result).toBe(true)
    })

    it('deve lançar erro quando há produtos associados', async () => {
      mockQueryWithRLS.mockResolvedValue([{ count: '5' }]) // 5 produtos associados

      await expect(categoryRepo.delete(tenantId, 'cat-123')).rejects.toThrow(
        'Não é possível excluir categoria que possui produtos associados'
      )
    })

    it('deve retornar false quando categoria não encontrada', async () => {
      mockQueryWithRLS
        .mockResolvedValueOnce([{ count: '0' }]) // Nenhum produto associado
        .mockResolvedValueOnce([]) // Categoria não encontrada

      const result = await categoryRepo.delete(tenantId, 'cat-123')

      expect(result).toBe(false)
    })
  })

  describe('count', () => {
    it('deve contar categorias corretamente', async () => {
      mockQueryWithRLS.mockResolvedValue([{ count: '3' }])

      const result = await categoryRepo.count(tenantId)

      expect(mockQueryWithRLS).toHaveBeenCalledWith(
        tenantId,
        'SELECT COUNT(*) as count FROM categorias'
      )
      expect(result).toBe(3)
    })
  })
}) 