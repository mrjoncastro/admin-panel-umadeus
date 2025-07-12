import { supabase, supabaseAdmin } from './supabaseClient'

// Função para criar um cliente Supabase (mantendo compatibilidade de assinatura)
export function createPocketBase() {
  return supabase
}

// Função para criar um cliente Supabase com permissões de admin
export function createPocketBaseAdmin() {
  return supabaseAdmin
}

// Função para atualizar o token de autenticação (compatível)
export function updateBaseAuth(token: string) {
  // No Supabase, o token é gerenciado automaticamente pelo cliente
  // Se necessário, pode-se usar supabase.auth.setSession(token)
  supabase.auth.setSession({ access_token: token, refresh_token: '' })
}

// Função para limpar autenticação
export function clearBaseAuth() {
  supabase.auth.signOut()
}

export default createPocketBase
