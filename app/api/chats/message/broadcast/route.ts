import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import type { UserModel } from '@/types/UserModel'
import { broadcastManager } from '@/lib/server/flows/whatsapp/broadcastManager'

export async function POST(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ errors: [auth.error] }, { status: auth.status })
  }
  const { pb, user } = auth

  try {
    const { message, recipients } = (await req.json()) as {
      message: string
      recipients: string[]
    }

    if (!message || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ errors: ['Parâmetros faltando'] }, { status: 400 })
    }

    const usuarios = await Promise.all(
      recipients.map((id) =>
        pb
          .collection('usuarios')
          .getOne<UserModel>(id)
          .catch(() => null)
      )
    )
    const validos = usuarios.filter(
      (u): u is UserModel => !!u && u.cliente === user.cliente && !!u.telefone
    )

    const waCfg = await pb
      .collection('whatsapp_clientes')
      .getFirstListItem(`cliente='${user.cliente}' && sessionStatus='connected'`)
      .catch(() => null)
    if (!waCfg) {
      return NextResponse.json(
        { errors: ['Configuração WhatsApp não encontrada ou não conectada'] },
        { status: 400 }
      )
    }

    if (validos.length === 0) {
      return NextResponse.json(
        { errors: ['Nenhum destinatário válido'] },
        { status: 400 }
      )
    }

    const messages = validos.map((u) => ({
      to: u.telefone!.replace(/\D/g, ''),
      message,
      instanceName: waCfg.instanceName,
      apiKey: waCfg.apiKey
    }))

    const result = await broadcastManager.addMessages(user.cliente, messages)

    if (!result.success) {
      return NextResponse.json({ errors: [result.message] }, { status: 400 })
    }

    const manager = broadcastManager as unknown as {
      queues: Map<string, { config: { delayBetweenMessages?: number; delayBetweenBatches?: number; batchSize?: number } }>
    }
    const queue = manager.queues.get(user.cliente)
    const cfg = queue?.config ?? {
      delayBetweenMessages: 3000,
      delayBetweenBatches: 15000,
      batchSize: 3
    }
    const estimatedSeconds =
      messages.length *
      ((cfg.delayBetweenMessages ?? 3000) + (cfg.delayBetweenBatches ?? 15000) / (cfg.batchSize ?? 3)) /
      1000
    const estimatedTime = Math.ceil(estimatedSeconds / 60)

    return NextResponse.json({
      success: true,
      message: result.message,
      queueId: result.queueId,
      totalMessages: messages.length,
      estimatedTime
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ errors: [msg] }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ errors: [auth.error] }, { status: auth.status })
  }
  const { user } = auth
  const stats = broadcastManager.getProgress(user.cliente)
  if (!stats) {
    return NextResponse.json({ message: 'Nenhum broadcast em andamento' })
  }

  const progress = { ...stats.progress, isProcessing: stats.isProcessing }
  return NextResponse.json({ message: 'Progresso do broadcast', progress })
}

export async function DELETE(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ errors: [auth.error] }, { status: auth.status })
  }
  const { user } = auth
  const stopped = broadcastManager.stopQueue(user.cliente)
  if (stopped) {
    return NextResponse.json({ message: 'Broadcast parado com sucesso' })
  }
  return NextResponse.json({ errors: ['Nenhum broadcast em andamento'] }, { status: 400 })
}
