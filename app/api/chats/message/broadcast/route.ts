import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { broadcastManager } from '@/lib/server/flows/whatsapp/broadcastManager'
import type { UserModel } from '@/types/UserModel'

export async function POST(req: NextRequest) {
  // Permissão: apenas coordenador
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

    // Busca dados dos destinatários
    const usuarios = await Promise.all(
      recipients.map((id) =>
        pb
          .collection('usuarios')
          .getOne<UserModel>(id)
          .catch(() => null),
      ),
    )
    const validos = usuarios.filter(
      (u): u is UserModel =>
        !!u && u.cliente === user.cliente && !!u.telefone,
    )

    if (validos.length === 0) {
      return NextResponse.json({ errors: ['Nenhum destinatário válido encontrado'] }, { status: 400 })
    }

    // Busca instanceId/apiKey do cliente
    const waCfg = await pb
      .collection('whatsapp_clientes')
      .getFirstListItem(`cliente='${user.cliente}' && sessionStatus='connected'`)
      .catch(() => null)
    
    if (!waCfg) {
      return NextResponse.json({ errors: ['Configuração WhatsApp não encontrada ou não conectada'] }, { status: 400 })
    }

    // Prepara mensagens para a fila
    const messages = validos.map(u => {
      const telefone = u.telefone?.replace(/\D/g, '')
      if (!telefone || telefone.length < 10) {
        throw new Error(`Telefone inválido: ${u.nome}`)
      }
      
      return {
        to: telefone,
        message,
        instanceName: waCfg.instanceName,
        apiKey: waCfg.apiKey
      }
    })

    // Adiciona mensagens à fila do tenant
    const result = await broadcastManager.addMessages(user.cliente, messages)

    if (!result.success) {
      return NextResponse.json({ errors: [result.message] }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      queueId: result.queueId,
      totalMessages: messages.length,
      estimatedTime: Math.ceil(messages.length * 3 / 60) // Estimativa em minutos
    }, { status: 200 })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ errors: [msg] }, { status: 500 })
  }
}

// Nova rota para obter progresso do broadcast
export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ errors: [auth.error] }, { status: auth.status })
  }
  const { user } = auth

  try {
    const progress = broadcastManager.getProgress(user.cliente)
    
    if (!progress) {
      return NextResponse.json({ 
        message: 'Nenhum broadcast em andamento',
        progress: null 
      }, { status: 200 })
    }

    return NextResponse.json({
      message: 'Progresso do broadcast',
      progress
    }, { status: 200 })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ errors: [msg] }, { status: 500 })
  }
}

// Rota para parar broadcast
export async function DELETE(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ errors: [auth.error] }, { status: auth.status })
  }
  const { user } = auth

  try {
    const stopped = broadcastManager.stopQueue(user.cliente)
    
    if (stopped) {
      return NextResponse.json({
        message: 'Broadcast parado com sucesso'
      }, { status: 200 })
    } else {
      return NextResponse.json({
        message: 'Nenhum broadcast em andamento para parar'
      }, { status: 200 })
    }

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ errors: [msg] }, { status: 500 })
  }
} 