import type { NextRequest } from 'next/server'
import type { RecordModel } from 'pocketbase'
import createPocketBase from '@/lib/pocketbase'
import { pbRetry } from '@/lib/pbRetry'
import { logConciliacaoErro } from '@/lib/server/logger'

export type ClienteAuthOk = {
  pb: ReturnType<typeof createPocketBase>
  cliente: RecordModel
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
    return { error: 'Dom\u00ednio ausente', status: 400 }
  }

  const pb = createPocketBase()

  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  try {
    const cfg = await pbRetry(() =>
      pb
        .collection('clientes_config')
        .getFirstListItem(`dominio = \"${host}\"`),
    )
    if (!cfg) {
      return { error: 'Cliente n\u00e3o encontrado', status: 404 }
    }
    const cliente = await pbRetry(() =>
      pb.collection('m24_clientes').getOne(cfg.cliente),
    )
    return { pb, cliente }
  } catch (err) {
    await logConciliacaoErro('Erro requireClienteFromHost: ' + String(err))
    return { error: 'Cliente n\u00e3o encontrado', status: 404 }
  }
}
