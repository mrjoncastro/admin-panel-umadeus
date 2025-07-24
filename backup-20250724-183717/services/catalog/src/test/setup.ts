import { vi } from 'vitest'

// Mock do dotenv
vi.mock('dotenv', () => ({
  default: {
    config: vi.fn()
  }
}))

// Mock do PostgreSQL
vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue({
      query: vi.fn().mockResolvedValue({ rows: [] }),
      release: vi.fn()
    })
  }))
}))

// Configurar variáveis de ambiente para testes
process.env['POSTGRES_HOST'] = 'localhost'
process.env['POSTGRES_PORT'] = '5432'
process.env['POSTGRES_DB'] = 'catalog_test'
process.env['POSTGRES_USER'] = 'postgres'
process.env['POSTGRES_PASSWORD'] = 'test'
process.env['NODE_ENV'] = 'test' 