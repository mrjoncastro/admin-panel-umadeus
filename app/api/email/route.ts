// app/api/email/route.ts
'use server'

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { promises as fs } from 'fs'
import path from 'path'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

export type Body = {
  eventType:
    | 'nova_inscricao'
    | 'confirmacao_inscricao'
    | 'novo_usuario'
    | 'confirmacao_pagamento'
    | 'promocao_lider'
  userId?: string
  email?: string
  name?: string
  paymentLink?: string
  loginLink?: string
  amount?: number
  dueDate?: string
  campoNome?: string
}

async function loadTemplate(name: string) {
  const file = path.join(
    process.cwd(),
    'lib',
    'templates',
    'email',
    `${name}.html`,
  )
  return fs.readFile(file, 'utf8')
}

export async function POST(req: NextRequest) {
  const pb = createPocketBase()

  try {
    // 1) parse + validação
    const {
      eventType,
      userId,
      email,
      name,
      paymentLink,
      loginLink,
      amount,
      dueDate,
      campoNome,
    } = (await req.json()) as Body
    if (!eventType || (!userId && !email)) {
      return NextResponse.json(
        { error: 'Parâmetros faltando' },
        { status: 400 },
      )
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
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 },
      )
    }

    // 4) obtém dados do usuário
    let userEmail = email
    let userName = name
    let campoNomeFinal = campoNome

    if (userId) {
      const user = await pb
        .collection('usuarios')
        .getOne(userId, { expand: 'campo' })
      userEmail = user.email
      userName = user.nome || user.name
      if (!campoNomeFinal) {
        campoNomeFinal = user.expand?.campo?.nome as string | undefined
      }
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'Usuário sem e-mail' }, { status: 400 })
    }

    // 5) monta subject + html
    const cor = cfg.cor_primary || '#7c3aed'
    const logo = cfg.logo ? pb.files.getUrl(cfg, cfg.logo) : cfg.logo_url || ''
    let subject: string, html: string

    switch (eventType) {
      case 'nova_inscricao':
        subject = '📝 Recebemos sua inscrição!'
        html = await loadTemplate('novaInscricao')
        break
      case 'confirmacao_inscricao':
        subject = '✅ Inscrição Confirmada'
        html = await loadTemplate('confirmacaoInscricao')
        html = html.replace(/{{paymentLink}}/g, paymentLink || '')
        break
      case 'novo_usuario':
        subject = '🎉 Conta criada com sucesso'
        html = await loadTemplate('novoUsuario')
        break
      case 'confirmacao_pagamento':
        subject = '💰 Pagamento Confirmado'
        html = await loadTemplate('confirmacaoPagamento')
        break
      case 'promocao_lider':
        subject = '🎉 Você agora é Líder!'
        html = await loadTemplate('promocaoLider')
        break
      default:
        return NextResponse.json({ error: 'Evento inválido' }, { status: 400 })
    }

    html = html
      .replace(/{{userName}}/g, userName || '')
      .replace(/{{logoUrl}}/g, logo)
      .replace(/{{cor_primary}}/g, cor)
      .replace(/{{tenantNome}}/g, cfg.nome || '')
      .replace(/{{loginLink}}/g, loginLink ?? `${req.nextUrl?.origin}/login`)
      .replace(/{{campoNome}}/g, campoNomeFinal ?? '')
      .replace(/{{amount}}/g, amount ? String(amount) : '')
      .replace(/{{dueDate}}/g, dueDate ?? '')

    // 6) configura o Nodemailer
    const transporter = nodemailer.createTransport({
      host: cfg.smtpHost || process.env.SMTP_HOST,
      port: Number(cfg.smtpPort || process.env.SMTP_PORT || 587),
      secure: cfg.smtpSecure ?? process.env.SMTP_SECURE === 'true',
      auth: {
        user: cfg.smtpUser || process.env.SMTP_USER,
        pass: cfg.smtpPass || process.env.SMTP_PASS,
      },
      connectionTimeout: 10_000,
      tls: { rejectUnauthorized: false },
    })

    // 7) envia o e-mail
    await transporter.verify()
    await transporter.sendMail({
      from: cfg.smtpFrom || process.env.SMTP_FROM!,
      to: userEmail,
      subject,
      html,
    })

    return NextResponse.json(
      { message: 'E-mail enviado com sucesso' },
      { status: 200 },
    )
  } catch (err: unknown) {
    // só log no servidor, sem expor detalhes ao cliente
    if (err instanceof Error) {
      console.error('🚨 [email/route] erro ao enviar e-mail:', err)
    } else {
      console.error(
        '🚨 [email/route] erro ao enviar e-mail (não-Error):',
        String(err),
      )
    }
    return NextResponse.json(
      { error: 'Erro interno ao enviar e-mail' },
      { status: 500 },
    )
  }
}
