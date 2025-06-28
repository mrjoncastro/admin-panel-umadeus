import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { renderTemplate, darkenColor } from '@/lib/server/email/renderTemplate'
import nodemailer from 'nodemailer'

interface TenantConfig {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_pass: string
  smtp_from: string
  logo_url: string
  cor_primary: string
  nome: string
  dominio: string
}

/**
 * Executa o fluxo completo de recuperação de senha multi-tenant
 * @param email Email do usuário
 * @returns Resultado da operação
 */
export async function requestPasswordResetManual(
  email: string
): Promise<{ success: boolean; message: string }> {
  const pb = createPocketBase()
  
  try {
    // 1. Identificar o tenant
    const tenantId = await getTenantFromHost()
    if (!tenantId) {
      throw new Error('Tenant não identificado')
    }

    // 2. Autenticar como admin
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!
      )
    }

    // 3. Buscar configuração do tenant
    const tenantConfig = await pb
      .collection('m24_clientes')
      .getOne<TenantConfig>(tenantId)

    // Validar campos obrigatórios
    const requiredFields = [
      'smtp_host',
      'smtp_port', 
      'smtp_user',
      'smtp_pass',
      'smtp_from',
      'logo_url',
      'cor_primary',
      'nome',
      'dominio'
    ]

    for (const field of requiredFields) {
      if (!tenantConfig[field as keyof TenantConfig]) {
        throw new Error(`Campo obrigatório não configurado: ${field}`)
      }
    }

    // 4. Buscar usuário pelo email
    const user = await pb
      .collection('usuarios')
      .getFirstListItem(`email="${email}" && cliente="${tenantId}"`)

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // 5. Gerar token de recuperação
    await pb.collection('usuarios').requestPasswordReset(email)
    
    // 6. Buscar o token gerado
    const updatedUser = await pb
      .collection('usuarios')
      .getOne(user.id)

    const token = updatedUser.verificationToken
    if (!token) {
      throw new Error('Token de verificação não gerado')
    }

    // 7. Obter host para URL
    const { headers } = await import('next/headers')
    const headerList = await headers()
    const host = headerList.get('host') || 'localhost:3000'

    // 8. Preparar dados do template
    const templateData = {
      token,
      app_name: tenantConfig.nome,
      logo_url: tenantConfig.logo_url,
      accent_color: tenantConfig.cor_primary,
      accent_color_dark: darkenColor(tenantConfig.cor_primary),
      url: `https://${host}`,
      dominio: tenantConfig.dominio
    }

    // 9. Renderizar template
    const html = await renderTemplate('resetPassword', templateData)

    // 10. Configurar transporter SMTP
    const transporter = nodemailer.createTransport({
      host: tenantConfig.smtp_host,
      port: tenantConfig.smtp_port,
      secure: tenantConfig.smtp_port === 465,
      auth: {
        user: tenantConfig.smtp_user,
        pass: tenantConfig.smtp_pass,
      },
      connectionTimeout: 10_000,
      tls: { rejectUnauthorized: false },
    })

    // 11. Verificar conexão SMTP
    await transporter.verify()

    // 12. Enviar e-mail
    await transporter.sendMail({
      from: tenantConfig.smtp_from,
      to: email,
      subject: `Redefinir Senha - ${tenantConfig.nome}`,
      html,
    })

    return {
      success: true,
      message: 'E-mail de recuperação enviado com sucesso'
    }

  } catch (error) {
    console.error('Erro na recuperação de senha:', error)
    
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message
      }
    }
    
    return {
      success: false,
      message: 'Erro interno na recuperação de senha'
    }
  }
} 