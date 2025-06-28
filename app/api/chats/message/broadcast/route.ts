import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { sendTextMessage } from '@/lib/server/chats'
import { requireRole } from '@/lib/apiAuth'

export async function POST(req: NextRequest) {
  // Permissão: apenas coordenador
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ errors: [auth.error] }, { status: auth.status })
  }
  const { pb, user } = auth

  try {
    const { message, role } = (await req.json()) as {
      message: string
      role: 'lider' | 'usuario' | 'todos'
    }
    if (!message || !role) {
      return NextResponse.json({ errors: ['Parâmetros faltando'] }, { status: 400 })
    }

    // Busca usuários conforme role
    let filter = `cliente='${user.cliente}' && telefone != '' && telefone != null`
    if (role === 'lider' || role === 'usuario') {
      filter += ` && role='${role}'`
    } else if (role === 'todos') {
      filter += ` && (role='lider' || role='usuario')`
    }

    const usuarios = await pb.collection('usuarios').getFullList({
      filter,
      sort: 'nome',
    })

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
      usuarios.map(async (u: any) => {
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