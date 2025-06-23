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
  console.log(`🧩 Carregando template: ${file}`)
  return fs.readFile(file, 'utf8')
}

export async function POST(req: NextRequest) {
  const pb = createPocketBase()

  try {
    const body = (await req.json()) as Body
    const { eventType, userId, paymentLink } = body
    console.log('📩 Dados recebidos:', body)

    if (!eventType || !userId) {
      console.warn('⚠️ Parâmetros obrigatórios ausentes')
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes' },
        { status: 400 },
      )
    }

    const tenantId = await getTenantFromHost()
    console.log('🏷️ Tenant detectado:', tenantId)

    if (!tenantId) {
      console.error('❌ Tenant não informado')
      return NextResponse.json(
        { error: 'Tenant não informado' },
        { status: 400 },
      )
    }

    const cfg = await pb.collection('clientes_config').getOne(tenantId)
    console.log('⚙️ Configurações do tenant:', cfg)

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
    console.log('👤 Usuário alvo:', user.email)

    if (!user.email) {
      console.warn('⚠️ Usuário sem e-mail cadastrado')
      return NextResponse.json(
        { error: 'Usuário sem e-mail cadastrado' },
        { status: 400 },
      )
    }

    let subject = ''
    let html = ''
    const cor = cfg.cor_primary || '#7c3aed'
    const logo = cfg.logo_url || ''
    console.log('🎨 Cor primária:', cor)
    console.log('🖼️ Logo:', logo)

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

    console.log('📧 Enviando e-mail para:', user.email)
    console.log('📌 Assunto:', subject)

    const info = await transporter.sendMail({
      from: cfg.smtpFrom || process.env.SMTP_FROM,
      to: user.email,
      subject,
      html,
    })

    console.log('✅ E-mail enviado com sucesso. ID:', info.messageId)

    return NextResponse.json({
      message: 'E-mail enviado',
      messageId: info.messageId,
    })
  } catch (err) {
    console.error('🚨 Erro ao enviar e-mail:', err)
    return NextResponse.json(
      { error: 'Erro ao enviar e-mail' },
      { status: 500 },
    )
  }
}
