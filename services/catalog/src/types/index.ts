export interface Product {
  id: string
  nome: string
  user_org: string
  quantidade: number
  preco: number
  preco_bruto: number
  ativo: boolean
  tamanhos?: string[]
  imagens?: string[]
  descricao?: string
  detalhes?: string
  categoria?: string
  slug: string
  cores?: string[]
  generos?: string[]
  cliente: string
  exclusivo_user?: boolean
  requer_inscricao_aprovada?: boolean
  evento_id?: string
  created: string
  updated: string
}

export interface Category {
  id: string
  nome: string
  slug: string
  cliente: string
  created: string
  updated: string
}

export interface CreateProductRequest {
  nome: string
  user_org: string
  quantidade: number
  preco: number
  preco_bruto: number
  ativo?: boolean
  tamanhos?: string[]
  imagens?: string[]
  descricao?: string
  detalhes?: string
  categoria?: string
  slug: string
  cores?: string[]
  generos?: string[]
  cliente: string
  exclusivo_user?: boolean
  requer_inscricao_aprovada?: boolean
  evento_id?: string
}

export interface UpdateProductRequest {
  nome?: string
  quantidade?: number
  preco?: number
  preco_bruto?: number
  ativo?: boolean
  tamanhos?: string[]
  imagens?: string[]
  descricao?: string
  detalhes?: string
  categoria?: string
  slug?: string
  cores?: string[]
  generos?: string[]
  exclusivo_user?: boolean
  requer_inscricao_aprovada?: boolean
  evento_id?: string
}

export interface CreateCategoryRequest {
  nome: string
  slug: string
  cliente: string
}

export interface UpdateCategoryRequest {
  nome?: string
  slug?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    perPage: number
    totalItems: number
    totalPages: number
  }
}

export interface QueryFilters {
  page?: number
  perPage?: number
  ativo?: boolean
  categoria?: string
  slug?: string
  cliente?: string
  search?: string
} 