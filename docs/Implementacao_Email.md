**Guia de Implementação de Envio de E-mails**

Este guia detalha os passos para criar uma rota unificada no Next.js que dispare e-mails aos usuários nos eventos:

- **nova_inscricao**
- **confirmacao_inscricao**
- **promocao_lider**

O fluxo abrange desde a configuração de SMTP por tenant no PocketBase até os testes das chamadas.

---

## 1. Visão Geral

Ao concluir este guia, você terá:

1. Uma rota `POST /api/email` implementada no **App Router** do Next.js.
2. Integração com o **PocketBase** para leitura de configurações SMTP por tenant.
3. Lógica de montagem de e-mail para cada tipo de evento.
4. Envio de e-mails via **Nodemailer**.
5. Exemplos de chamadas para testes.

## 2. Pré-requisitos

### 2.1 Dependências do Projeto

- Next.js (v13+ com App Router)
- PocketBase configurado e acessível na camada server (ex.: `lib/server/pocketbase.ts`) citeturn0file1
- Biblioteca **Nodemailer**

Instale o Nodemailer:

```bash
npm install nodemailer
# ou
yarn add nodemailer
```

### 2.2 Documentação e Arquivos de Apoio

- **docs/arquitetura.md**: identificação de tenants via `getTenantFromHost()` citeturn0file0
- **docs/regras-inscricoes.md**: regras de negócio para inscrições
- **docs/regras-pedidos.md** e **docs/plano_calculo_cobrancas.md**: cálculo e cadastro de cobranças

## 3. Configuração de Variáveis de Ambiente

Se a estratégia for global (um servidor SMTP único), defina no Vercel/Cloud:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Para **multi-tenant**, adicione campos na coleção `clientes_config`:

| Campo       | Tipo    | Descrição                                                  |
| ----------- | ------- | ---------------------------------------------------------- |
| smtpHost    | String  | Endereço do servidor SMTP                                  |
| smtpPort    | Number  | Porta do servidor SMTP                                     |
| smtpSecure  | Boolean | true para TLS/SSL                                          |
| smtpUser    | String  | Usuário de autenticação                                    |
| smtpPass    | String  | Senha de autenticação                                      |
| smtpFrom    | String  | Nome e e-mail remetente (`App <noreply@...>`)              |
| cor_primary | String  | Cor primária do tenant (hex, rgb ou variável CSS dinâmica) |

> O `TenantProvider` (ou `getTenantFromHost(req)`) retorna `tenantId`, usado para buscar essas configurações.

### 3.1 Configuração e Testes Multi-Tenant

1. **Preenchimento no PocketBase**: no painel de administração, configure em **clientes_config** os campos `smtpHost`, `smtpPort`, `smtpSecure`, `smtpUser`, `smtpPass`, `smtpFrom` e `cor_primary` para cada tenant.
2. **Verificação no Código**: assegure-se de que `await pb.collection('clientes_config').getOne(tenantId)` retorna todos os campos SMTP e `cor_primary` corretamente.
3. **Testes de Envio**: execute chamadas à rota `/api/email` utilizando cada tipo de evento:
   - `nova_inscricao`
   - `confirmacao_inscricao` (opcionalmente fornecendo `paymentLink`)
   - `promocao_lider`

4. **Conferência de Logs**: examine o console do servidor Next.js para confirmar a autenticação do Nodemailer e o envio dos e-mails, identificando possíveis erros.

---

## 4. Estrutura de Dados no PocketBase

1. **users**: já existente, garante campos `id`, `name` e `email`.
2. **cobrancas**: contém `id`, `valor` (number) e `vencimento` (date).
3. **clientes_config**: conforme tabela acima.

> Exemplo de registro em `clientes_config`:
>
> ```json
> {
>   "id": "abc123",
>   "smtpHost": "smtp.servico.com",
>   "smtpPort": 465,
>   "smtpSecure": true,
>   "smtpUser": "user@servico.com",
>   "smtpPass": "segredo",
>   "smtpFrom": "MeuApp <no-reply@meuapp.com>",
>   "cor_primary": "#1a73e8"
> }
> ```

## 5. Implementação da Rota `app/api/email/route.ts`

### 5.1 Criação do Arquivo e Importações

```ts
// app/api/email/route.ts
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import pb from '@/lib/server/pocketbase'
import { getTenantFromHost } from '@/lib/server/tenancy'
```

### 5.2 Definição do Body e Tipagem

```ts
type Body = {
  eventType: 'nova_inscricao' | 'confirmacao_inscricao' | 'promocao_lider'
  userId: string
  paymentLink?: string
}
```

### 5.3 Lógica de Busca de Configurações SMTP e Usuário

```ts
const tenant = getTenantFromHost(req)
const cfg = await pb.collection('clientes_config').getOne(tenant)
const transporter = nodemailer.createTransport({
  host: cfg.smtpHost,
  port: cfg.smtpPort,
  secure: cfg.smtpSecure,
  auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
})

const user = await pb.collection('users').getOne(userId)
if (!user.email) {
  return NextResponse.json(
    { error: 'Usuário sem e-mail cadastrado' },
    { status: 400 },
  )
}
```

### 5.4 Montagem de Assunto e HTML para Cada Evento

```ts
let subject: string
let html: string
switch (eventType) {
  case 'nova_inscricao':
    subject = '📝 Recebemos sua inscrição!'
    html = `<p>Olá ${user.name},</p><p>Sua inscrição foi registrada com sucesso.</p>`
    break

  case 'confirmacao_inscricao':
    subject = '✅ Inscrição Confirmada'
    html = `<p>Parabéns, ${user.name}! Sua inscrição foi confirmada.</p>`
    if (paymentLink) {
      html += `<p><a href="${paymentLink}">Pagar Agora</a></p>`
    }
    break
}
```

### 5.5 Envio de E-mail e Resposta

```ts
const info = await transporter.sendMail({
  from: cfg.smtpFrom,
  to: user.email,
  subject,
  html,
})
return NextResponse.json({
  message: 'E-mail enviado',
  messageId: info.messageId,
})
```

## 6. Testes e Uso

### 6.1 Exemplos de Chamadas

- **Nova Inscrição**

  ```ts
  await fetch('/api/email', {
    method: 'POST',
    body: JSON.stringify({ eventType: 'nova_inscricao', userId: 'abc123' }),
  })
  ```

- **Confirmação de Inscrição**

  ```ts
  await fetch('/api/email', {
    method: 'POST',
    body: JSON.stringify({
      eventType: 'confirmacao_inscricao',
      userId: 'abc123',
    }),
  })
  ```

- **Promoção a Líder**

  ```ts
  await fetch('/api/email', {
    method: 'POST',
    body: JSON.stringify({
      eventType: 'promocao_lider',
      userId: 'abc123',
      campoNome: 'Campo Norte',
    }),
  })
  ```

Verifique logs no console do servidor e retornos HTTP (200 OK ou erros 4xx/5xx).

## 7. Boas Práticas

- **Templates**: utilize engines como EJS, Handlebars ou MJML para e-mails mais ricos.
- **Retries**: implemente retentativas automáticas em falhas (ex.: `p-retry`).
- **PocketBase Retry**: utilize `lib/pbRetry.ts` para repetir chamadas ao PocketBase até 3 vezes em erros de rede.
- Todas as rotas de API agora utilizam `pbRetry` ao acessar o PocketBase.
- **Logs estruturados**: registre tentativas e falhas em `logs/ERR_LOG.md`.
- **Monitoramento de entregabilidade**: use webhooks do provedor SMTP.

## 8. Próximos Passos

- Criação de dashboards de métricas de envio (success vs bounce).
- Suporte a anexos e e-mails transacionais adicionais.
- Internacionalização (i18n) de templates.

## 9. Referências

- `docs/arquitetura.md` (tenancy) citeturn0file0
- `docs/regras-inscricoes.md`
- `docs/regras-pedidos.md` / `plano_calculo_cobrancas.md`
- Next.js App Router: [API Routes](https://nextjs.org/docs/app/building-your-application/routing/router-conventions)
- Nodemailer: [https://nodemailer.com/about/](https://nodemailer.com/about/)

---

## 10. Modelos de Templates de E-mail

Os templates abaixo usam tokens do nosso Design System (cores, tipografia e espaçamentos) definidos em `app/globals.css`, integrando variáveis CSS e classes utilitárias conforme definido em `docs/design-system.md` fileciteturn1file0 e `docs/design-tokens.md` citeturn1file1.

### 10.1 Template: Nova Inscrição

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recebemos sua inscrição</title>
  </head>
  <body
    style="margin:0; padding:0; background:var(--background); font-family:var(--font-body);"
  >
    <!-- Preheader -->
    <span
      style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;"
      >Recebemos sua inscrição com sucesso!</span
    >
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:var(--space-md);">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            class="card"
          >
            <!-- Header -->
            <tr>
              <td align="center" style="padding:var(--space-lg);">
                <img src="{{logoUrl}}" alt="Logo" width="120" class="" />
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:var(--space-md); color:var(--text-primary);">
                <h2 class="heading" style="color: {{cor_primary}};">
                  Olá, {{userName}}
                </h2>
                <p>Sua inscrição foi registrada com sucesso.</p>
                <p>Em breve entraremos em contato com os próximos passos.</p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td
                style="padding:var(--space-md); font-size:0.875rem; color:var(--text-secondary); text-align:center;"
              >
                <p>Se não solicitou este e‑mail, ignore-o.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

### 10.2 Template: Confirmação de Inscrição

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Inscrição Confirmada</title>
  </head>
  <body
    style="margin:0; padding:0; background:var(--background); font-family:var(--font-body);"
  >
    <span
      style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;"
      >Sua inscrição foi confirmada!</span
    >
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:var(--space-md);">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            class="card"
          >
            <tr>
              <td align="center" style="padding:var(--space-lg);">
                <img src="{{logoUrl}}" alt="Logo" width="120" />
              </td>
            </tr>
            <tr>
              <td style="padding:var(--space-md); color:var(--text-primary);">
                <h2 class="heading" style="color: {{cor_primary}};">
                  Parabéns, {{userName}}!
                </h2>
                <p>Sua inscrição foi confirmada e está tudo pronto。</p>
              </td>
            </tr>
            <tr>
              <td
                style="padding:var(--space-md); font-size:0.875rem; color:var(--text-secondary); text-align:center;"
              >
                <p>Se não solicitou este e‑mail, ignore-o。</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```
