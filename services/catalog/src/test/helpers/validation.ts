import { Product, Category } from '../../types'

export const validateProduct = (product: unknown): product is Product => {
  const requiredFields = [
    'id', 'nome', 'user_org', 'quantidade', 'preco', 
    'preco_bruto', 'ativo', 'slug', 'cliente'
  ]

  return requiredFields.every(field => product.hasOwnProperty(field))
}

export const validateCategory = (category: unknown): category is Category => {
  const requiredFields = ['id', 'nome', 'slug', 'cliente']

  return requiredFields.every(field => category.hasOwnProperty(field))
}

export const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  nome: 'Produto Teste',
  user_org: 'user-123',
  quantidade: 10,
  preco: 29.90,
  preco_bruto: 32.90,
  ativo: true,
  tamanhos: ['P', 'M', 'G'],
  imagens: ['image1.jpg'],
  descricao: 'Descrição do produto',
  detalhes: 'Detalhes do produto',
  categoria: 'cat-123',
  slug: 'produto-teste',
  cores: ['#000000'],
  generos: ['masculino'],
  cliente: 'tenant-123',
  exclusivo_user: false,
  requer_inscricao_aprovada: false,
  evento_id: null,
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-01-01T00:00:00.000Z',
  ...overrides
})

export const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: '123e4567-e89b-12d3-a456-426614174001',
  nome: 'Categoria Teste',
  slug: 'categoria-teste',
  cliente: 'tenant-123',
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-01-01T00:00:00.000Z',
  ...overrides
})

export const createMockProductData = (overrides: Partial<Omit<Product, 'id' | 'created' | 'updated'>> = {}) => ({
  nome: 'Novo Produto',
  user_org: 'user-123',
  quantidade: 5,
  preco: 19.90,
  preco_bruto: 21.90,
  ativo: true,
  slug: 'novo-produto',
  cliente: 'tenant-123',
  ...overrides
})

export const createMockCategoryData = (overrides: Partial<Omit<Category, 'id' | 'created' | 'updated'>> = {}) => ({
  nome: 'Nova Categoria',
  slug: 'nova-categoria',
  cliente: 'tenant-123',
  ...overrides
}) 