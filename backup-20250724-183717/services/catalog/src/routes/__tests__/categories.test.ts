import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import categoriesRouter from '../v1/categories'
import { mockCategory, mockCategories } from '../../test/mocks/database'

// Mock do CategoryRepository
vi.mock('../../repositories/CategoryRepository', () => ({
  CategoryRepository: vi.fn().mockImplementation(() => ({
    findAll: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn()
  }))
}))

const app = express()
app.use(express.json())
app.use('/api/v1/categories', categoriesRouter)

describe('Categories Routes', () => {
  const tenantId = 'tenant-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/v1/categories', () => {
    it('deve listar categorias com sucesso', async () => {
      const { CategoryRepository } = await import('../../repositories/CategoryRepository')
      const mockRepo = new CategoryRepository()
      
      vi.mocked(mockRepo.findAll).mockResolvedValue(mockCategories)

      const response = await request(app)
        .get('/api/v1/categories')
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: mockCategories
      })
    })

    it('deve retornar erro quando tenant-id não fornecido', async () => {
      const response = await request(app)
        .get('/api/v1/categories')

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/categories/:id', () => {
    it('deve retornar categoria por ID', async () => {
      const { CategoryRepository } = await import('../../repositories/CategoryRepository')
      const mockRepo = new CategoryRepository()
      
      vi.mocked(mockRepo.findById).mockResolvedValue(mockCategory)

      const response = await request(app)
        .get('/api/v1/categories/cat-123')
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: mockCategory
      })
    })

    it('deve retornar 404 quando categoria não encontrada', async () => {
      const { CategoryRepository } = await import('../../repositories/CategoryRepository')
      const mockRepo = new CategoryRepository()
      
      vi.mocked(mockRepo.findById).mockResolvedValue(null)

      const response = await request(app)
        .get('/api/v1/categories/cat-123')
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Categoria não encontrada')
    })
  })

  describe('POST /api/v1/categories', () => {
    it('deve criar categoria com sucesso', async () => {
      const { CategoryRepository } = await import('../../repositories/CategoryRepository')
      const mockRepo = new CategoryRepository()
      
      const categoryData = {
        nome: 'Nova Categoria',
        slug: 'nova-categoria'
      }

      vi.mocked(mockRepo.create).mockResolvedValue(mockCategory)

      const response = await request(app)
        .post('/api/v1/categories')
        .set('x-tenant-id', tenantId)
        .send(categoryData)

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        success: true,
        data: mockCategory,
        message: 'Categoria criada com sucesso'
      })
    })

    it('deve retornar erro de validação para dados inválidos', async () => {
      const invalidData = {
        nome: '', // Nome vazio
        slug: '' // Slug vazio
      }

      const response = await request(app)
        .post('/api/v1/categories')
        .set('x-tenant-id', tenantId)
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Dados inválidos')
    })
  })

  describe('PATCH /api/v1/categories/:id', () => {
    it('deve atualizar categoria com sucesso', async () => {
      const { CategoryRepository } = await import('../../repositories/CategoryRepository')
      const mockRepo = new CategoryRepository()
      
      const updateData = {
        nome: 'Categoria Atualizada',
        slug: 'categoria-atualizada'
      }

      vi.mocked(mockRepo.update).mockResolvedValue(mockCategory)

      const response = await request(app)
        .patch('/api/v1/categories/cat-123')
        .set('x-tenant-id', tenantId)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: mockCategory,
        message: 'Categoria atualizada com sucesso'
      })
    })

    it('deve retornar 404 quando categoria não encontrada', async () => {
      const { CategoryRepository } = await import('../../repositories/CategoryRepository')
      const mockRepo = new CategoryRepository()
      
      vi.mocked(mockRepo.update).mockResolvedValue(null)

      const response = await request(app)
        .patch('/api/v1/categories/cat-123')
        .set('x-tenant-id', tenantId)
        .send({ nome: 'Atualizada' })

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })
  })

  describe('DELETE /api/v1/categories/:id', () => {
    it('deve deletar categoria com sucesso', async () => {
      const { CategoryRepository } = await import('../../repositories/CategoryRepository')
      const mockRepo = new CategoryRepository()
      
      vi.mocked(mockRepo.delete).mockResolvedValue(true)

      const response = await request(app)
        .delete('/api/v1/categories/cat-123')
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        message: 'Categoria deletada com sucesso'
      })
    })

    it('deve retornar 404 quando categoria não encontrada', async () => {
      const { CategoryRepository } = await import('../../repositories/CategoryRepository')
      const mockRepo = new CategoryRepository()
      
      vi.mocked(mockRepo.delete).mockResolvedValue(false)

      const response = await request(app)
        .delete('/api/v1/categories/cat-123')
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })

    it('deve retornar erro quando há produtos associados', async () => {
      const { CategoryRepository } = await import('../../repositories/CategoryRepository')
      const mockRepo = new CategoryRepository()
      
      vi.mocked(mockRepo.delete).mockRejectedValue(
        new Error('Não é possível excluir categoria que possui produtos associados')
      )

      const response = await request(app)
        .delete('/api/v1/categories/cat-123')
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Não é possível excluir categoria que possui produtos associados')
    })
  })
}) 