import { vi } from 'vitest'

export const mockQueryWithRLS = vi.fn()
export const mockQuery = vi.fn()
export const mockGetClientWithRLS = vi.fn()
export const mockGetClient = vi.fn()
export const mockSetupRLS = vi.fn()

export const mockPool = {
  connect: vi.fn().mockResolvedValue({
    query: vi.fn().mockResolvedValue({ rows: [] }),
    release: vi.fn()
  })
}

// Mock dos dados de teste
export const mockProduct = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  nome: 'Produto Teste',
  user_org: 'user-123',
  quantidade: 10,
  preco: 29.90,
  preco_bruto: 32.90,
  ativo: true,
  tamanhos: ['P', 'M', 'G'],
  imagens: ['image1.jpg', 'image2.jpg'],
  descricao: 'Descrição do produto teste',
  detalhes: 'Detalhes completos do produto',
  categoria: 'cat-123',
  slug: 'produto-teste',
  cores: ['#000000', '#FFFFFF'],
  generos: ['masculino', 'feminino'],
  cliente: 'tenant-123',
  exclusivo_user: false,
  requer_inscricao_aprovada: false,
  evento_id: null,
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-01-01T00:00:00.000Z'
}

export const mockCategory = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  nome: 'Categoria Teste',
  slug: 'categoria-teste',
  cliente: 'tenant-123',
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-01-01T00:00:00.000Z'
}

export const mockProducts = [mockProduct]
export const mockCategories = [mockCategory] 