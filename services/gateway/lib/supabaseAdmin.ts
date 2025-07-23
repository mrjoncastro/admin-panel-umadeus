import { createClient } from '@supabase/supabase-js'
import { Database } from './supabaseClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase admin environment variables')
}

// Cliente administrativo com service role key
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Função helper para autenticar admin operations
export async function withAdminAuth<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    logger.error('Admin operation failed:', error)
    throw error
  }
}

// Buscar usuário por ID
export async function getUsuarioById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Buscar configuração do cliente
export async function getClienteConfig(clienteId: string) {
  const { data, error } = await supabaseAdmin
    .from('clientes_config')
    .select('*')
    .eq('cliente', clienteId)
    .single()

  if (error) throw error
  return data
}

// Buscar inscrições
export async function getInscricoes(filter?: string, tenantId?: string) {
  let query = supabaseAdmin
    .from('inscricoes')
    .select('*, usuario:usuarios(*), evento:eventos(*)')

  if (tenantId) {
    query = query.eq('cliente', tenantId)
  }

  if (filter) {
    query = query.eq('status', filter)
  }

  const { data, error } = await query.order('created', { ascending: false })

  if (error) throw error
  return data || []
}

// Buscar pedidos
export async function getPedidos(filter?: string, tenantId?: string) {
  let query = supabaseAdmin
    .from('pedidos')
    .select('*, usuario:usuarios(*)')

  if (tenantId) {
    query = query.eq('cliente', tenantId)
  }

  if (filter) {
    query = query.eq('status', filter)
  }

  const { data, error } = await query.order('created', { ascending: false })

  if (error) throw error
  return data || []
}

// Atualizar inscrição
export async function updateInscricao(id: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('inscricoes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Atualizar pedido
export async function updatePedido(id: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('pedidos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Criar produto
export async function createProduto(produto: any) {
  const { data, error } = await supabaseAdmin
    .from('produtos')
    .insert(produto)
    .select()
    .single()

  if (error) throw error
  return data
}import { logger } from '@/lib/logger'
