import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { logger } from '@/lib/logger'

export type ClienteAuthOk = {
  cliente: any // Tipo do cliente do Supabase
  config: any // Configuração do cliente
}

export type ClienteAuthError = {
  error: string
  status: number
}

export async function requireClienteFromHost(
  req: NextRequest,
): Promise<ClienteAuthOk | ClienteAuthError> {
  const host = req.headers.get('host')?.split(':')[0] ?? ''
  if (!host) {
    return { error: 'Domínio ausente', status: 400 }
  }

  try {
    // Buscar configuração do cliente pelo domínio
    const { data: config, error: configError } = await supabaseAdmin
      .from('clientes_config')
      .select('*')
      .eq('dominio', host)
      .single()

    if (configError || !config) {
      logger.warn('Cliente não encontrado para domínio', { host })
      return { error: 'Cliente não encontrado', status: 404 }
    }

    // Buscar dados do cliente
    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from('m24_clientes')
      .select('*')
      .eq('id', config.cliente)
      .single()

    if (clienteError || !cliente) {
      logger.error('Dados do cliente não encontrados', { clienteId: config.cliente })
      return { error: 'Cliente não encontrado', status: 404 }
    }

    return { cliente, config }
  } catch (err) {
    logger.error('Erro requireClienteFromHost', err)
    return { error: 'Cliente não encontrado', status: 404 }
  }
}
