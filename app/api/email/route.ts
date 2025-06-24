// app/api/email/route.ts
'use server'

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { promises as fs } from 'fs'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { logConciliacaoErro } from '@/lib/server/logger'

export type Body = {
  eventType: 'nova_inscricao' | 'confirmacao_inscricao'
  userId:    string
  paymentLink?: string
}

async function loadTemplate(name: string) {
  return fs.readFile(`lib/templates/email/${name}.html`, 'utf8')
}

export async function POST(req: NextRequest) {
  const pb = createPocketBase()

  try {
    // 1) parse + validação
    const { eventType, userId, paymentLink } = (await req.json()) as Body
    if (!eventType || !userId) {
      return NextResponse.json({ error: 'Parâmetros faltando' }, { status: 400 })
    }

    // 2) identifica o tenant e autentica no PB
    const clienteId = await getTenantFromHost()
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!,
      )
    }

    // 3) busca config do PocketBase
    const cfg = await pb
      .collection('clientes_config')
      .getFirstListItem(`cliente='${clienteId}'`)
    if (!cfg) {
      return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 404 })
    }

    // 4) busca usuário
    const user = await pb.collection('usuarios').getOne(userId)
    if (!user.email) {
      return NextResponse.json({ error: 'Usuário sem e-mail' }, { status: 400 })
    }

    // 5) monta subject + html
    const cor  = cfg.cor_primary || '#7c3aed'
    const logo = cfg.logo_url    || ''
    let subject: string, html: string

    if (eventType === 'nova_inscricao') {
      subject = '📝 Recebemos sua inscrição!'
      html    = await loadTemplate('novaInscricao')
    } else {
      subject = '✅ Inscrição Confirmada'
      html    = await loadTemplate('confirmacaoInscricao')
      html    = html.replace(/{{paymentLink}}/g, paymentLink || '')
    }

    html = html
      .replace(/{{userName}}/g, user.nome || user.name || '')
      .replace(/{{logoUrl}}/g, logo)
      .replace(/{{cor_primary}}/g, cor)

    // 6) configura o Nodemailer
    const transporter = nodemailer.createTransport({
      host:   cfg.smtpHost   || process.env.SMTP_HOST,
      port:   Number(cfg.smtpPort   || process.env.SMTP_PORT   || 587),
      secure: cfg.smtpSecure ?? (process.env.SMTP_SECURE === 'true'),
      auth: {
        user: cfg.smtpUser   || process.env.SMTP_USER,
        pass: cfg.smtpPass   || process.env.SMTP_PASS,
      },
      connectionTimeout: 10_000,
      tls: { rejectUnauthorized: false }
    })

    // 7) envia o e-mail
    await transporter.verify()
    await transporter.sendMail({
      from:    cfg.smtpFrom || process.env.SMTP_FROM!,
      to:      user.email,
      subject,
      html,
    })

    return NextResponse.json({ message: 'E-mail enviado com sucesso' }, { status: 200 })
  } catch (err: unknown) {
    // só log no servidor, sem expor detalhes ao cliente
    const msg =
      err instanceof Error
        ? `🚨 [email/route] erro ao enviar e-mail: ${err.message}`
        : `🚨 [email/route] erro ao enviar e-mail (não-Error): ${String(err)}`
    await logConciliacaoErro(msg)
    return NextResponse.json(
      { error: 'Erro interno ao enviar e-mail' },
      { status: 500 },
    )
  }
}
