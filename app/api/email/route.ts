import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { promises as fs } from 'fs'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

export type Body = {
  eventType: 'nova_inscricao' | 'confirmacao_inscricao'
  userId: string
  paymentLink?: string
}

async function loadTemplate(name: string) {
  const file = `lib/templates/email/${name}.html`
  return fs.readFile(file, 'utf8')
}

export async function POST(req: NextRequest) {
  const pb = createPocketBase()
  try {
    const body = (await req.json()) as Body
    const { eventType, userId, paymentLink } = body

    if (!eventType || !userId) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes' },
        { status: 400 },
      )
    }

    const tenantId = await getTenantFromHost()
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant não informado' },
        { status: 400 },
      )
    }

    const cfg = await pb.collection('clientes_config').getOne(tenantId)

    const transporter = nodemailer.createTransport({
      host: cfg.smtpHost || process.env.SMTP_HOST,
      port: Number(cfg.smtpPort || process.env.SMTP_PORT || 0),
      secure: Boolean(cfg.smtpSecure ?? process.env.SMTP_SECURE === 'true'),
      auth: {
        user: cfg.smtpUser || process.env.SMTP_USER,
        pass: cfg.smtpPass || process.env.SMTP_PASS,
      },
    })

    const user = await pb.collection('users').getOne(userId)
    if (!user.email) {
      return NextResponse.json(
        { error: 'Usuário sem e-mail cadastrado' },
        { status: 400 },
      )
    }

    let subject = ''
    let html = ''
    const cor = cfg.cor_primary || '#7c3aed'
    const logo = cfg.logo_url || ''

    switch (eventType) {
      case 'nova_inscricao': {
        subject = '📝 Recebemos sua inscrição!'
        html = await loadTemplate('novaInscricao')
        html = html
          .replace(/{{userName}}/g, user.nome || user.name || '')
          .replace(/{{logoUrl}}/g, logo)
          .replace(/{{cor_primary}}/g, cor)
        break
      }
      case 'confirmacao_inscricao': {
        subject = '✅ Inscrição Confirmada'
        html = await loadTemplate('confirmacaoInscricao')
        html = html
          .replace(/{{userName}}/g, user.nome || user.name || '')
          .replace(/{{paymentLink}}/g, paymentLink || '')
          .replace(/{{logoUrl}}/g, logo)
          .replace(/{{cor_primary}}/g, cor)
        break
      }
    }

    const info = await transporter.sendMail({
      from: cfg.smtpFrom || process.env.SMTP_FROM,
      to: user.email,
      subject,
      html,
    })

    return NextResponse.json({
      message: 'E-mail enviado',
      messageId: info.messageId,
    })
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err)
    return NextResponse.json(
      { error: 'Erro ao enviar e-mail' },
      { status: 500 },
    )
  }
}
