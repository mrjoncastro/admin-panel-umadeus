// Tipos globais para o Catalog Service (compatível com Supabase)

export type Cliente = {
  id: string
  nome: string
  dominio: string
  created_at: string
  updated_at: string
}

export type ClientesConfig = {
  id: string
  cliente: string
  cor_primary?: string
  font?: string
  confirma_inscricoes?: boolean
  dominio: string
  nome?: string
  created_at: string
  updated_at: string
}

export type Campo = {
  id: string
  nome: string
  cliente: string
  created_at: string
  updated_at: string
}

export type Usuario = {
  id: string
  nome: string
  email: string
  senha: string
  cliente: string
  role: string
  telefone?: string
  cpf?: string
  data_nascimento?: string
  genero?: string
  endereco?: string
  numero?: number
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  email_visibility?: boolean
  verified?: boolean
  campo?: string
  created_at: string
  updated_at: string
}

export type Categoria = {
  id: string
  nome: string
  slug: string
  cliente: string
  created_at: string
  updated_at: string
}

export type Produto = {
  id: string
  nome: string
  preco: number
  descricao?: string
  categoria: string
  cliente: string
  imagens?: string[]
  tamanhos?: string[]
  cores?: string[]
  ativo: boolean
  created_at: string
  updated_at: string
}

export type Pedido = {
  id: string
  user_id: string
  produto_ids: string[]
  total: number
  status: string
  cliente: string
  created_at: string
  updated_at: string
}

export type CommissionTransaction = {
  id: string
  pedido_id: string
  user_id: string
  valor_bruto: number
  fee_fixed: number
  fee_percent: number
  split: Record<string, unknown>
  payment_method: string
  installments?: number
  status: string
  cliente: string
  created_at: string
  updated_at: string
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