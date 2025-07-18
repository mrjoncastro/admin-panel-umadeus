# 📁 Estrutura de Projeto – M24Vendas

Este documento descreve a **arquitetura de pastas e responsabilidades** do projeto M24Vendas, com orientações baseadas em **boas práticas de desenvolvimento, organização e performance**.

---

## 🧭 Visão Geral

O projeto é dividido logicamente em quatro áreas principais:

| Área      | Função Principal                          | Acesso         | Público-alvo            |
| --------- | ----------------------------------------- | -------------- | ----------------------- |
| **Loja**  | Página pública para venda e inscrições    | Público        | Visitantes e inscritos  |
| **Admin** | Painel de gestão e controle de dados      | Privado (auth) | Coordenadores e líderes |
| **Blog**  | Página pública para postagens de conteúdo | Público        | Visitantes e inscritos  |
| **API**   | Rotas e integrações backend               | Protegido      | Sistema e integrações   |

Todas coexistem no mesmo projeto Next.js (App Router) hospedado na **Vercel**.

---

## 📦 Estrutura de Pastas (atualizada)

```bash
/app
├── admin/                 # Painel administrativo completo
│   ├── api/               # Rotas internas do admin
│   ├── campos/            # Gestão de campos de atuação
│   ├── clientes/          # Gestão de clientes
│   ├── componentes/       # Componentes exclusivos do admin
│   ├── conclusao/         # Página exibida após concluir inscrição
│   ├── configuracoes/     # Configurações do sistema/admin
│   ├── dashboard/         # Painel principal do administrador
│   ├── erro/              # Página de erro genérica
│   ├── eventos/           # Gestão de eventos
│   ├── financeiro/        # Gestão financeira e saldo
│   ├── inscricoes/        # Listagem e gestão de inscrições
│   ├── lider-painel/      # Painel exclusivo para lideranças locais
│   ├── not-found.tsx      # Página 404 do admin
│   ├── obrigado/          # Página de agradecimento
│   ├── pedidos/           # Gestão de pedidos vinculados à inscrição
│   ├── pendente/          # Tela para inscrições pendentes
│   ├── perfil/            # Tela de perfil do usuário logado
│   ├── posts/             # Gestão de posts
│   ├── produtos/          # Gestão de produtos
│   ├── redefinir-senha/   # Recuperação de senha
│   ├── relatorio/         # Relatórios individuais
│   ├── relatorios/        # Relatórios gerais
│   ├── usuarios/          # Gestão de usuários autenticados
│   ├── whatsapp/          # Integração WhatsApp
│   └── layout.tsx         # Layout do admin com navegação segura
├── blog/                  # Páginas do blog e posts
│   ├── components/        # Componentes do blog
│   ├── post/              # Página individual de post
│   ├── layout.tsx         # Layout do blog
│   ├── page.tsx           # Listagem de posts
│   └── BlogClient.dynamic.tsx # Wrapper do cliente
├── loja/                  # Área pública da vitrine e inscrições
│   ├── api/               # Rotas de API da loja
│   ├── carrinho/          # Visualização e gestão do carrinho de compras
│   ├── categorias/        # Filtros e páginas de cada categoria de produto
│   ├── checkout/          # Processo de pagamento e finalização do pedido
│   ├── cliente/           # Área do cliente com pedidos e dados pessoais
│   ├── componentes/       # Componentes reutilizáveis da loja
│   ├── eventos/           # Formulário de inscrição em eventos
│   ├── inscricoes/        # Envio e visualização pública (se necessário)
│   ├── login/             # Rotas de autenticação da loja
│   ├── perfil/            # Perfil do cliente
│   ├── produtos/          # Listagem e detalhes dos produtos
│   ├── sucesso/           # Página de sucesso de compra
│   ├── layout.tsx         # Layout público da loja
│   ├── metadata.ts        # Metadados dinâmicos
│   ├── not-found.tsx      # Página 404 da loja
│   └── page.tsx           # Home da loja
├── api/                   # Rotas de API e webhooks (Next.js API routes)
│   ├── asaas/             # Integração com Asaas
│   ├── auth/              # Autenticação
│   ├── campos/            # API de campos
│   ├── chats/             # API de chats
│   ├── checkout-link/     # API de links de checkout
│   ├── email/             # Envio de e-mails
│   ├── eventos/           # API de eventos
│   ├── inscricoes/        # API de inscrições
│   ├── lider/             # API de líderes
│   ├── pedidos/           # API de pedidos
│   ├── posts/             # API de posts
│   ├── produtos/          # API de produtos
│   ├── recuperar-link/    # Recuperação de links
│   ├── register/          # Registro de usuários
│   ├── sentry-example-api/# Exemplo de integração Sentry
│   ├── signup/            # Cadastro
│   ├── tasks/             # Tarefas agendadas
│   ├── tenant/            # Multi-tenant
│   ├── tenant-config/     # Configuração de tenant
│   ├── usuario/           # API de usuário
│   └── usuarios/          # API de usuários
├── auth/                  # Fluxos de autenticação (reset, confirmação)
├── campos/                # Páginas sobre os campos de atuação
├── cliente/               # Área do cliente (dashboard, perfil, pedidos)
├── completar-cadastro/    # Finalização de cadastro
├── components/            # Componentes compartilhados entre áreas
├── globals.css            # CSS global compartilhado
├── iniciar-tour/          # Passo a passo inicial para novos usuários
├── inscricoes/            # Formulário público de inscrições
├── layout.tsx             # Layout raiz compartilhado
├── login/                 # Autenticação geral do sistema
├── page.tsx               # Página inicial
├── recuperar/             # Recuperação de links/pagamentos
├── sentry-example-page/   # Página de exemplo Sentry
├── signup/                # Cadastro geral
├── stories/               # Storybook de componentes
├── utils/                 # Utilitários globais

/components
├── admin/                 # Componentes exclusivos do admin
├── atoms/                 # Elementos básicos do design system (Button, Spinner, etc)
├── molecules/             # Combinações de átomos (inputs, cards, etc)
├── organisms/             # Blocos de UI complexos (modais, tabelas, formulários)
├── templates/             # Layouts e telas inteiras
├── onboarding/            # Componentes do onboarding
├── ui/                    # Componentes de UI genéricos
├── index.ts               # Exportação central

/lib
├── apiAuth.ts             # Utilitário de autenticação
├── asaas.ts               # Integração com Asaas
├── asaasFees.ts           # Cálculo de taxas Asaas
├── bankAccounts.ts        # Utilitários de contas bancárias
├── chartSetup.ts          # Configuração de gráficos
├── clienteAuth.ts         # Autenticação do cliente
├── constants.ts           # Constantes globais
├── context/               # Contextos React (Auth, Cart, Onboarding, Tenant, Theme, Toast)
├── flows/                 # Fluxos de negócio (ex: orderFlow)
├── hooks/                 # Hooks customizados (useAuth, useAuthGuard, useInscricoes, etc)
├── posts/                 # Utilitários para posts
├── products/              # Utilitários para produtos
├── report/                # Geração de relatórios e PDFs
├── server/                # Utilidades do servidor
├── services/              # Integrações externas (ex: pocketbase)
├── templates/             # Templates de e-mail e outros
├── utils/                 # Funções utilitárias

/__tests__
├── a11y/                  # Testes de acessibilidade
├── admin/                 # Testes de rotas e lógica admin
├── api/                   # Testes de rotas e lógica de API
├── mocks/                 # Mocks para testes
├── Diversos arquivos .test.tsx e .test.ts para cobertura de componentes, fluxos, utilitários, hooks, etc.

/logs/                     # Registros de documentação e erros
├── DOC_LOG.md             # Log de alterações documentais
├── ERR_LOG.md             # Log de erros e resoluções

/public/                   # Arquivos estáticos (imagens, favicon, etc)
/scripts/                  # Scripts auxiliares
/types/                    # Definições TypeScript globais

```

---

## 🔌 Middleware de Tenant

O arquivo `middleware.ts` intercepta cada requisição, consulta a coleção `clientes_config` do PocketBase para descobrir o tenant associado ao domínio e injeta o cabeçalho `x-tenant-id`. Também grava o cookie `tenantId` para que páginas e APIs identifiquem o cliente ativo sem depender de parâmetros na URL.

## 🌐 Site – Boas Práticas

- Mantém a identidade visual do cliente de forma _white label_
- Permite customização de logo e cores via painel admin (`/admin/configuracoes`)
- Integra navegação para Loja, Admin e Blog
- Detalhes em [docs/design-system.md](docs/design-system.md#personalizacao)

## 🛍️ Loja – Boas Práticas

- Roteamento claro e semântica amigável (ex: `/loja/produtos/kit-jovem`)
- SEO: uso de metadados dinâmicos e URLs limpas
- Utilizar `next export` para páginas estáticas
- Separar lógica de exibição (componentes) da lógica de dados (`lib`/`utils`)
- Formulários com validação (Zod ou HTML5) + feedback visual
- Responsivo (mobile-first) com Tailwind

## ✍️ Blog – Boas Práticas

- Postagens carregadas da coleção `posts` do PocketBase
- Componentes em `app/blog/components`
- Utilize `BlogClient.tsx` para exibir os posts no cliente

---

## 🛠️ Admin – Boas Práticas

- Rotas protegidas com `useAuthGuard` e validação de `role`
- Algumas rotas de confirmação de inscrição são públicas:
  `/admin/obrigado`, `/admin/conclusao`, `/admin/pendente`, `/admin/erro`,
  `/auth/confirm-password-reset` e `/auth/confirm-password-reset/[token]`,
  além de `/admin/inscricoes/recuperar`
- Layout persistente com navegação clara entre seções (dashboard, pedidos, etc)
- Paginação, filtros e expand para consultas PocketBase
- Armazenamento de token com `pb.authStore` e persistência no localStorage
- Preferir chamadas via `getList()` com `expand` para evitar múltiplas requisições
- Limpar dados e tokens no logout (`pb.authStore.clear()`)

---

## ⚙️ Performance e Desenvolvimento

- Componentes desacoplados e reutilizáveis
- Usar `useMemo`/`useCallback` para evitar renders desnecessários
- Evitar `any` e manter todos os dados tipados via `types/`
- Aplicar lazy loading para rotas não críticas (`next/dynamic`)
- Dividir código entre `/lib`, `/hooks` e `/utils` para clareza
- Rodar `next build` e `npm run export` para verificar compatibilidade de build estático

---

## ✅ Checklist de Qualidade

- [ ] Todas as rotas públicas funcionam sem autenticação
- [ ] Painel admin exige login e validação de role
- [ ] Componentes são reutilizáveis e coesos
- [ ] Formulários validam dados e exibem status (loading, erro, sucesso)
- [ ] Layout responsivo e acessível
- [ ] Integração com PocketBase documentada e centralizada
- [ ] Testes automatizados cobrindo áreas críticas (unitários, integração, acessibilidade)

---

## 📌 Considerações Finais

Esta estrutura busca garantir **clareza, escalabilidade e manutenibilidade** do projeto M24Vendas, atendendo tanto ao público final quanto às lideranças administrativas. Deve ser evoluída com base no crescimento do projeto, mantendo a consistência na organização e nos princípios de performance, testes e segurança.
