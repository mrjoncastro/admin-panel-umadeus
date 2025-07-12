import type { NextRequest } from 'next/server'
import { supabase } from './supabaseClient'

export function getPocketBaseFromRequest(req: NextRequest) {
  // No Supabase, a autenticação é gerenciada automaticamente
  // O cliente já está configurado para detectar sessões em cookies
  return supabase
}

// Função alternativa para obter cliente Supabase com contexto de request
export function getSupabaseFromRequest(req: NextRequest) {
  return supabase
}
