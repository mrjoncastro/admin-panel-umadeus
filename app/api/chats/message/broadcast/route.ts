import { NextRequest, NextResponse } from 'next/server'
import { sendTextMessage } from '@/lib/server/chats'
import { requireRole } from '@/lib/apiAuth'
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

    // Busca instanceId/apiKey do cliente
    const waCfg = await pb
      .collection('whatsapp_clientes')
      .getFirstListItem(`cliente='${user.cliente}' && sessionStatus='connected'`)
      .catch(() => null)
    if (!waCfg) {
      return NextResponse.json({ errors: ['Configuração WhatsApp não encontrada ou não conectada'] }, { status: 400 })
    }

    let success = 0
    let failed = 0
    const errors: string[] = []

    // Envia mensagem para cada usuário
    await Promise.all(
      validos.map(async (u) => {
        try {
          const telefone = u.telefone?.replace(/\D/g, '')
          if (!telefone || telefone.length < 10) {
            failed++
            errors.push(`Telefone inválido: ${u.nome}`)
            return
          }
          await sendTextMessage({
            instanceName: waCfg.instanceName,
            apiKey: waCfg.apiKey,
            to: telefone,
            message,
          })
          success++
        } catch (err) {
          failed++
          errors.push(`${u.nome}: ${(err as Error).message}`)
        }
      })
    )

    return NextResponse.json({ success, failed, errors }, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ errors: [msg] }, { status: 500 })
  }
} 