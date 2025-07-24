import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import productsRouter from '../v1/products'
import { mockProduct, mockProducts } from '../../test/mocks/database'

// Mock do ProductRepository
vi.mock('../../repositories/ProductRepository', () => ({
  ProductRepository: vi.fn().mockImplementation(() => ({
    findAll: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    updateStock: vi.fn()
  }))
}))

const app = express()
app.use(express.json())
app.use('/api/v1/products', productsRouter)

describe('Products Routes', () => {
  const tenantId = 'tenant-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/v1/products', () => {
    it('deve listar produtos com sucesso', async () => {
      const { ProductRepository } = await import('../../repositories/ProductRepository')
      const mockRepo = new ProductRepository()
      
      vi.mocked(mockRepo.findAll).mockResolvedValue(mockProducts)
      vi.mocked(mockRepo.count).mockResolvedValue(1)

      const response = await request(app)
        .get('/api/v1/products')
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        pagination: {
          page: 1,
          perPage: 20,
          totalItems: 1,
          totalPages: 1
        }
      })
    })

    it('deve retornar erro quando tenant-id não fornecido', async () => {
      const response = await request(app)
        .get('/api/v1/products')

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
    })

    it('deve aplicar filtros de query', async () => {
      const { ProductRepository } = await import('../../repositories/ProductRepository')
      const mockRepo = new ProductRepository()
      
      vi.mocked(mockRepo.findAll).mockResolvedValue(mockProducts)
      vi.mocked(mockRepo.count).mockResolvedValue(1)

      const response = await request(app)
        .get('/api/v1/products?ativo=true&categoria=cat-123&search=teste')
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(200)
      expect(mockRepo.findAll).toHaveBeenCalledWith(tenantId, {
        page: 1,
        perPage: 20,
        ativo: true,
        categoria: 'cat-123',
        search: 'teste'
      })
    })
  })

  describe('GET /api/v1/products/:id', () => {
    it('deve retornar produto por ID', async () => {
      const { ProductRepository } = await import('../../repositories/ProductRepository')
      const mockRepo = new ProductRepository()
      
      vi.mocked(mockRepo.findById).mockResolvedValue(mockProduct)

      const response = await request(app)
        .get('/api/v1/products/product-123')
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: mockProduct
      })
    })

    it('deve retornar 404 quando produto não encontrado', async () => {
      const { ProductRepository } = await import('../../repositories/ProductRepository')
      const mockRepo = new ProductRepository()
      
      vi.mocked(mockRepo.findById).mockResolvedValue(null)

      const response = await request(app)
        .get('/api/v1/products/product-123')
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Produto não encontrado')
    })
  })

  describe('POST /api/v1/products', () => {
    it('deve criar produto com sucesso', async () => {
      const { ProductRepository } = await import('../../repositories/ProductRepository')
      const mockRepo = new ProductRepository()
      
      const productData = {
        nome: 'Novo Produto',
        user_org: 'user-123',
        quantidade: 10,
        preco: 29.90,
        preco_bruto: 32.90,
        slug: 'novo-produto'
      }

      vi.mocked(mockRepo.create).mockResolvedValue(mockProduct)

      const response = await request(app)
        .post('/api/v1/products')
        .set('x-tenant-id', tenantId)
        .send(productData)

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        success: true,
        data: mockProduct,
        message: 'Produto criado com sucesso'
      })
    })

    it('deve retornar erro de validação para dados inválidos', async () => {
      const invalidData = {
        nome: '', // Nome vazio
        quantidade: -1 // Quantidade negativa
      }

      const response = await request(app)
        .post('/api/v1/products')
        .set('x-tenant-id', tenantId)
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Dados inválidos')
    })
  })

  describe('PATCH /api/v1/products/:id', () => {
    it('deve atualizar produto com sucesso', async () => {
      const { ProductRepository } = await import('../../repositories/ProductRepository')
      const mockRepo = new ProductRepository()
      
      const updateData = {
        nome: 'Produto Atualizado',
        preco: 39.90
      }

      vi.mocked(mockRepo.update).mockResolvedValue(mockProduct)

      const response = await request(app)
        .patch('/api/v1/products/product-123')
        .set('x-tenant-id', tenantId)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: mockProduct,
        message: 'Produto atualizado com sucesso'
      })
    })

    it('deve retornar 404 quando produto não encontrado', async () => {
      const { ProductRepository } = await import('../../repositories/ProductRepository')
      const mockRepo = new ProductRepository()
      
      vi.mocked(mockRepo.update).mockResolvedValue(null)

      const response = await request(app)
        .patch('/api/v1/products/product-123')
        .set('x-tenant-id', tenantId)
        .send({ nome: 'Atualizado' })

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })
  })

  describe('DELETE /api/v1/products/:id', () => {
    it('deve deletar produto com sucesso', async () => {
      const { ProductRepository } = await import('../../repositories/ProductRepository')
      const mockRepo = new ProductRepository()
      
      vi.mocked(mockRepo.delete).mockResolvedValue(true)

      const response = await request(app)
        .delete('/api/v1/products/product-123')
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        message: 'Produto deletado com sucesso'
      })
    })

    it('deve retornar 404 quando produto não encontrado', async () => {
      const { ProductRepository } = await import('../../repositories/ProductRepository')
      const mockRepo = new ProductRepository()
      
      vi.mocked(mockRepo.delete).mockResolvedValue(false)

      const response = await request(app)
        .delete('/api/v1/products/product-123')
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })
  })

  describe('PATCH /api/v1/products/:id/stock', () => {
    it('deve atualizar estoque com sucesso', async () => {
      const { ProductRepository } = await import('../../repositories/ProductRepository')
      const mockRepo = new ProductRepository()
      
      vi.mocked(mockRepo.updateStock).mockResolvedValue(mockProduct)

      const response = await request(app)
        .patch('/api/v1/products/product-123/stock')
        .set('x-tenant-id', tenantId)
        .send({ quantity: 2 })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: mockProduct,
        message: 'Estoque atualizado com sucesso'
      })
    })

    it('deve retornar erro para quantidade inválida', async () => {
      const response = await request(app)
        .patch('/api/v1/products/product-123/stock')
        .set('x-tenant-id', tenantId)
        .send({ quantity: -1 })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Quantidade deve ser um número positivo')
    })

    it('deve retornar erro quando estoque insuficiente', async () => {
      const { ProductRepository } = await import('../../repositories/ProductRepository')
      const mockRepo = new ProductRepository()
      
      vi.mocked(mockRepo.updateStock).mockResolvedValue(null)

      const response = await request(app)
        .patch('/api/v1/products/product-123/stock')
        .set('x-tenant-id', tenantId)
        .send({ quantity: 100 })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Estoque insuficiente ou produto não encontrado')
    })
  })
}) 