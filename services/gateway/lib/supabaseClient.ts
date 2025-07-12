import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Cliente para operações do servidor (com mais permissões)
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Tipos para as tabelas
export type Database = {
  public: {
    Tables: {
      m24_clientes: {
        Row: {
          id: string
          nome: string
          dominio: string
          responsavel_email: string | null
          ativo: boolean
          documento: string
          asaas_account_id: string
          asaas_api_key: string
          verificado: boolean | null
          tipo_dominio: string | null
          modo_validacao: string | null
          usuario: string
          created: string
          updated: string
        }
        Insert: {
          id?: string
          nome: string
          dominio: string
          responsavel_email?: string | null
          ativo: boolean
          documento: string
          asaas_account_id: string
          asaas_api_key: string
          verificado?: boolean | null
          tipo_dominio?: string | null
          modo_validacao?: string | null
          usuario: string
          created?: string
          updated?: string
        }
        Update: {
          id?: string
          nome?: string
          dominio?: string
          responsavel_email?: string | null
          ativo?: boolean
          documento?: string
          asaas_account_id?: string
          asaas_api_key?: string
          verificado?: boolean | null
          tipo_dominio?: string | null
          modo_validacao?: string | null
          usuario?: string
          created?: string
          updated?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          password: string
          tokenKey: string | null
          email: string
          emailVisibility: boolean
          verified: boolean
          nome: string | null
          role: string
          campo: string | null
          telefone: string | null
          cpf: string | null
          data_nascimento: string | null
          cliente: string
          endereco: string | null
          estado: string | null
          cep: string | null
          cidade: string | null
          numero: string | null
          bairro: string | null
          genero: string | null
          created: string
          updated: string
        }
        Insert: {
          id?: string
          password: string
          tokenKey?: string | null
          email: string
          emailVisibility?: boolean
          verified?: boolean
          nome?: string | null
          role: string
          campo?: string | null
          telefone?: string | null
          cpf?: string | null
          data_nascimento?: string | null
          cliente: string
          endereco?: string | null
          estado?: string | null
          cep?: string | null
          cidade?: string | null
          numero?: string | null
          bairro?: string | null
          genero?: string | null
          created?: string
          updated?: string
        }
        Update: {
          id?: string
          password?: string
          tokenKey?: string | null
          email?: string
          emailVisibility?: boolean
          verified?: boolean
          nome?: string | null
          role?: string
          campo?: string | null
          telefone?: string | null
          cpf?: string | null
          data_nascimento?: string | null
          cliente?: string
          endereco?: string | null
          estado?: string | null
          cep?: string | null
          cidade?: string | null
          numero?: string | null
          bairro?: string | null
          genero?: string | null
          created?: string
          updated?: string
        }
      }
      produtos: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          preco: number
          preco_promocional: number | null
          imagem: string | null
          ativo: boolean
          categoria: string | null
          cliente: string
          created: string
          updated: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          preco: number
          preco_promocional?: number | null
          imagem?: string | null
          ativo?: boolean
          categoria?: string | null
          cliente: string
          created?: string
          updated?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          preco?: number
          preco_promocional?: number | null
          imagem?: string | null
          ativo?: boolean
          categoria?: string | null
          cliente?: string
          created?: string
          updated?: string
        }
      }
      categorias: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          cliente: string
          created: string
          updated: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          cliente: string
          created?: string
          updated?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          cliente?: string
          created?: string
          updated?: string
        }
      }
      pedidos: {
        Row: {
          id: string
          usuario: string
          status: string
          valor_total: number
          forma_pagamento: string | null
          cliente: string
          created: string
          updated: string
        }
        Insert: {
          id?: string
          usuario: string
          status?: string
          valor_total: number
          forma_pagamento?: string | null
          cliente: string
          created?: string
          updated?: string
        }
        Update: {
          id?: string
          usuario?: string
          status?: string
          valor_total?: number
          forma_pagamento?: string | null
          cliente?: string
          created?: string
          updated?: string
        }
      }
      inscricoes: {
        Row: {
          id: string
          usuario: string
          evento: string | null
          status: string
          cliente: string
          created: string
          updated: string
        }
        Insert: {
          id?: string
          usuario: string
          evento?: string | null
          status?: string
          cliente: string
          created?: string
          updated?: string
        }
        Update: {
          id?: string
          usuario?: string
          evento?: string | null
          status?: string
          cliente?: string
          created?: string
          updated?: string
        }
      }
      clientes_config: {
        Row: {
          id: string
          cor_primary: string | null
          dominio: string
          cliente: string
          font: string | null
          nome: string | null
          confirma_inscricoes: boolean | null
          logo: string | null
          smtpHost: string | null
          smtpPort: number | null
          smtpSecure: boolean | null
          smtpUser: string | null
          smtpPass: string | null
          smtpFrom: string | null
          created: string
          updated: string
        }
        Insert: {
          id?: string
          cor_primary?: string | null
          dominio: string
          cliente: string
          font?: string | null
          nome?: string | null
          confirma_inscricoes?: boolean | null
          logo?: string | null
          smtpHost?: string | null
          smtpPort?: number | null
          smtpSecure?: boolean | null
          smtpUser?: string | null
          smtpPass?: string | null
          smtpFrom?: string | null
          created?: string
          updated?: string
        }
        Update: {
          id?: string
          cor_primary?: string | null
          dominio?: string
          cliente?: string
          font?: string | null
          nome?: string | null
          confirma_inscricoes?: boolean | null
          logo?: string | null
          smtpHost?: string | null
          smtpPort?: number | null
          smtpSecure?: boolean | null
          smtpUser?: string | null
          smtpPass?: string | null
          smtpFrom?: string | null
          created?: string
          updated?: string
        }
      }
    }
  }
}

// Função para configurar o tenant_id baseado no domínio
export async function setTenantFromDomain(domain: string) {
  const { data: cliente } = await supabase
    .from('m24_clientes')
    .select('id')
    .eq('dominio', domain)
    .single()

  if (cliente) {
    // Definir o tenant_id para a sessão atual
    await supabase.rpc('set_tenant_from_domain', { domain_name: domain })
    return cliente.id
  }
  
  return null
}

// Função para obter configuração do tenant
export async function getTenantConfig(tenantId: string) {
  const { data: config } = await supabase
    .from('clientes_config')
    .select('*')
    .eq('cliente', tenantId)
    .single()

  return config
}

// Função para autenticar usuário
export async function authenticateUser(email: string, password: string) {
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .eq('password', password) // Em produção, usar hash da senha
    .single()

  if (error) throw error
  return user
}

// Função para buscar usuário por email
export async function getUserByEmail(email: string) {
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single()

  if (error) throw error
  return user
}

// Função para buscar produtos por cliente
export async function getProductsByClient(clientId: string) {
  const { data: products, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('cliente', clientId)
    .eq('ativo', true)

  if (error) throw error
  return products
}

// Função para buscar categorias por cliente
export async function getCategoriesByClient(clientId: string) {
  const { data: categories, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('cliente', clientId)

  if (error) throw error
  return categories
}

// Função para buscar pedidos por cliente
export async function getOrdersByClient(clientId: string) {
  const { data: orders, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('cliente', clientId)

  if (error) throw error
  return orders
}

// Função para buscar inscrições por cliente
export async function getSubscriptionsByClient(clientId: string) {
  const { data: subscriptions, error } = await supabase
    .from('inscricoes')
    .select('*')
    .eq('cliente', clientId)

  if (error) throw error
  return subscriptions
}