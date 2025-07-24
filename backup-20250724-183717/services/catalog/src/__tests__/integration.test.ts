import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../index'
import { query } from '../database/connection'

// Mock do banco de dados para testes de integração
vi.mock('../database/connection', () => ({
  query: vi.fn(),
  queryWithRLS: vi.fn(),
  getClientWithRLS: vi.fn(),
  getClient: vi.fn(),
  setupRLS: vi.fn()
}))

describe('Catalog Service Integration Tests', () => {
  const tenantId = 'test-tenant-123'
  const baseUrl = '/api/v1'

  beforeAll(async () => {
    // Configurar dados de teste no banco
    await setupTestData()
  })

  afterAll(async () => {
    // Limpar dados de teste
    await cleanupTestData()
  })

  beforeEach(async () => {
    vi.clearAllMocks()
  })

  describe('Health Check', () => {
    it('deve retornar status de saúde', async () => {
      const response = await request(app)
        .get('/health')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        service: 'catalog',
        version: '1.0.0',
        timestamp: expect.any(String)
      })
    })
  })

  describe('Products API', () => {
    it('deve criar, listar, atualizar e deletar produto', async () => {
      const productData = {
        nome: 'Produto Teste Integração',
        user_org: 'user-test',
        quantidade: 15,
        preco: 25.90,
        preco_bruto: 28.90,
        slug: 'produto-teste-integracao',
        descricao: 'Produto para teste de integração'
      }

      // Mock para criação
      vi.mocked(query).mockResolvedValueOnce([{
        id: 'prod-123',
        ...productData,
        cliente: tenantId,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }])

      // Mock para listagem
      vi.mocked(query).mockResolvedValueOnce([{
        id: 'prod-123',
        ...productData,
        cliente: tenantId,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }])

      // Mock para contagem
      vi.mocked(query).mockResolvedValueOnce([{ count: '1' }])

      // 1. Criar produto
      const createResponse = await request(app)
        .post(`${baseUrl}/products`)
        .set('x-tenant-id', tenantId)
        .send(productData)

      expect(createResponse.status).toBe(201)
      expect(createResponse.body.success).toBe(true)
      expect(createResponse.body.data.nome).toBe(productData.nome)

      // 2. Listar produtos
      const listResponse = await request(app)
        .get(`${baseUrl}/products`)
        .set('x-tenant-id', tenantId)

      expect(listResponse.status).toBe(200)
      expect(listResponse.body.success).toBe(true)
      expect(listResponse.body.data).toHaveLength(1)
      expect(listResponse.body.pagination.totalItems).toBe(1)

      // 3. Buscar produto por ID
      const productId = createResponse.body.data.id
      const getResponse = await request(app)
        .get(`${baseUrl}/products/${productId}`)
        .set('x-tenant-id', tenantId)

      expect(getResponse.status).toBe(200)
      expect(getResponse.body.data.id).toBe(productId)

      // 4. Atualizar produto
      const updateData = { nome: 'Produto Atualizado', preco: 30.90 }
      const updateResponse = await request(app)
        .patch(`${baseUrl}/products/${productId}`)
        .set('x-tenant-id', tenantId)
        .send(updateData)

      expect(updateResponse.status).toBe(200)
      expect(updateResponse.body.data.nome).toBe('Produto Atualizado')

      // 5. Deletar produto
      const deleteResponse = await request(app)
        .delete(`${baseUrl}/products/${productId}`)
        .set('x-tenant-id', tenantId)

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body.success).toBe(true)
    })

    it('deve validar dados obrigatórios na criação', async () => {
      const invalidData = {
        nome: '', // Nome vazio
        quantidade: -1 // Quantidade negativa
      }

      const response = await request(app)
        .post(`${baseUrl}/products`)
        .set('x-tenant-id', tenantId)
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Dados inválidos')
    })

    it('deve retornar erro sem tenant-id', async () => {
      const response = await request(app)
        .get(`${baseUrl}/products`)

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
    })
  })

  describe('Categories API', () => {
    it('deve criar, listar, atualizar e deletar categoria', async () => {
      const categoryData = {
        nome: 'Categoria Teste Integração',
        slug: 'categoria-teste-integracao'
      }

      // Mock para criação
      vi.mocked(query).mockResolvedValueOnce([{
        id: 'cat-123',
        ...categoryData,
        cliente: tenantId,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }])

      // Mock para listagem
      vi.mocked(query).mockResolvedValueOnce([{
        id: 'cat-123',
        ...categoryData,
        cliente: tenantId,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }])

      // 1. Criar categoria
      const createResponse = await request(app)
        .post(`${baseUrl}/categories`)
        .set('x-tenant-id', tenantId)
        .send(categoryData)

      expect(createResponse.status).toBe(201)
      expect(createResponse.body.success).toBe(true)

      // 2. Listar categorias
      const listResponse = await request(app)
        .get(`${baseUrl}/categories`)
        .set('x-tenant-id', tenantId)

      expect(listResponse.status).toBe(200)
      expect(listResponse.body.success).toBe(true)
      expect(listResponse.body.data).toHaveLength(1)

      // 3. Atualizar categoria
      const categoryId = createResponse.body.data.id
      const updateResponse = await request(app)
        .patch(`${baseUrl}/categories/${categoryId}`)
        .set('x-tenant-id', tenantId)
        .send({ nome: 'Categoria Atualizada' })

      expect(updateResponse.status).toBe(200)
      expect(updateResponse.body.data.nome).toBe('Categoria Atualizada')

      // 4. Deletar categoria
      const deleteResponse = await request(app)
        .delete(`${baseUrl}/categories/${categoryId}`)
        .set('x-tenant-id', tenantId)

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('deve retornar 404 para rotas não encontradas', async () => {
      const response = await request(app)
        .get('/api/v1/not-found')

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Rota não encontrada')
    })

    it('deve lidar com erros internos do servidor', async () => {
      // Mock para simular erro no banco
      vi.mocked(query).mockRejectedValueOnce(new Error('Database error'))

      const response = await request(app)
        .get(`${baseUrl}/products`)
        .set('x-tenant-id', tenantId)

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Erro interno do servidor')
    })
  })
})

// Funções auxiliares para setup e cleanup
async function setupTestData() {
  // Configurar dados de teste se necessário
  console.log('🔧 Configurando dados de teste...')
}

async function cleanupTestData() {
  // Limpar dados de teste se necessário
  console.log('🧹 Limpando dados de teste...')
} 