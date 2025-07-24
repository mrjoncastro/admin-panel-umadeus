import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Pool } from 'pg'
import { queryWithRLS, query, getClientWithRLS, setupRLS } from '../database/connection'

// Mock do PostgreSQL
vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue({
      query: vi.fn().mockResolvedValue({ rows: [] }),
      release: vi.fn()
    })
  }))
}))

describe('Database Connection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('setupRLS', () => {
    it('deve configurar RLS corretamente', async () => {
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] })
      }
      const tenantId = 'tenant-123'

      await setupRLS(mockClient as any, tenantId)

      expect(mockClient.query).toHaveBeenCalledWith(
        'SET app.tenant_id = $1',
        [tenantId]
      )
    })
  })

  describe('getClientWithRLS', () => {
    it('deve obter cliente com RLS configurado', async () => {
      const mockPool = {
        connect: vi.fn().mockResolvedValue({
          query: vi.fn().mockResolvedValue({ rows: [] }),
          release: vi.fn()
        })
      }

      vi.mocked(Pool).mockImplementation(() => mockPool as any)

      const tenantId = 'tenant-123'
      const client = await getClientWithRLS(tenantId)

      expect(mockPool.connect).toHaveBeenCalled()
      expect(client).toBeDefined()
    })
  })

  describe('queryWithRLS', () => {
    it('deve executar query com RLS', async () => {
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [{ id: 1, nome: 'test' }] }),
        release: vi.fn()
      }

      vi.mocked(Pool).mockImplementation(() => ({
        connect: vi.fn().mockResolvedValue(mockClient)
      } as any))

      const tenantId = 'tenant-123'
      const sql = 'SELECT * FROM produtos'
      const params = ['param1']

      const result = await queryWithRLS(tenantId, sql, params)

      expect(mockClient.query).toHaveBeenCalledWith(sql, params)
      expect(result).toEqual([{ id: 1, nome: 'test' }])
      expect(mockClient.release).toHaveBeenCalled()
    })

    it('deve liberar conexão mesmo em caso de erro', async () => {
      const mockClient = {
        query: vi.fn().mockRejectedValue(new Error('Database error')),
        release: vi.fn()
      }

      vi.mocked(Pool).mockImplementation(() => ({
        connect: vi.fn().mockResolvedValue(mockClient)
      } as any))

      const tenantId = 'tenant-123'
      const sql = 'SELECT * FROM produtos'

      await expect(queryWithRLS(tenantId, sql)).rejects.toThrow('Database error')
      expect(mockClient.release).toHaveBeenCalled()
    })
  })

  describe('query', () => {
    it('deve executar query sem RLS', async () => {
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [{ id: 1, nome: 'test' }] }),
        release: vi.fn()
      }

      vi.mocked(Pool).mockImplementation(() => ({
        connect: vi.fn().mockResolvedValue(mockClient)
      } as any))

      const sql = 'SELECT * FROM produtos'
      const params = ['param1']

      const result = await query(sql, params)

      expect(mockClient.query).toHaveBeenCalledWith(sql, params)
      expect(result).toEqual([{ id: 1, nome: 'test' }])
      expect(mockClient.release).toHaveBeenCalled()
    })
  })

  describe('Connection Pool', () => {
    it('deve configurar pool com parâmetros corretos', () => {
      const mockPool = {
        connect: vi.fn()
      }

      vi.mocked(Pool).mockImplementation(() => mockPool as any)

      // Importar novamente para testar configuração
      require('../database/connection')

      expect(Pool).toHaveBeenCalledWith({
        host: 'localhost',
        port: 5432,
        database: 'catalog',
        user: 'postgres',
        password: 'example',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      })
    })
  })
}) 