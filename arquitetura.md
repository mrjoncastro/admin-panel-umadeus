# 📁 Estrutura de Projeto – M24Vendas

Este documento descreve a **arquitetura de pastas e responsabilidades** do projeto M24Vendas, com orientações baseadas em **boas práticas de desenvolvimento, organização e performance**.

---

## 🧭 Visão Geral

O projeto é dividido logicamente em quatro áreas:

| Área      | Função Principal                          | Acesso         | Público-alvo            |
| --------- | ----------------------------------------- | -------------- | ----------------------- |
| **Loja**  | Página pública para venda e inscrições    | Público        | Visitantes e inscritos  |
| **Admin** | Painel de gestão e controle de dados      | Privado (auth) | Coordenadores e líderes |
| **Blog**  | Página pública para postagens de conteúdo | Público        | Visitantes e inscritos  |

Todas coexistem no mesmo projeto Next.js (App Router) hospedado na **Vercel**.

---

## 📦 Estrutura de Pastas

```bash
/app
├── admin/                 # Painel administrativo completo
│   ├── api/               # Rotas internas (se necessário)
│   ├── campos/            # Gestão de campos de atuação
│   ├── components/        # Componentes exclusivos do admin
│   ├── dashboard/         # Painel principal do administrador
│   ├── erro/              # Página de erro genérica
│   ├── inscricoes/        # Listagem e gestão de inscrições
│   ├── lider-painel/      # Painel exclusivo para lideranças locais
│   ├── obrigado/          # Página de agradecimento
│   ├── pedidos/           # Gestão de pedidos vinculados à inscrição
│   ├── pendente/          # Tela para inscrições pendentes
│   ├── perfil/            # Tela de perfil do usuário logado
│   ├── redefinir-senha/   # Recuperação de senha
│   └── usuarios/          # Gestão de usuários autenticados
│   └── layout.tsx         # Layout do admin com navegação segura
├── blog/                  # Páginas do blog e posts
│   ├── components/        # Componentes do blog
│   ├── post/[slug]/       # Página individual de post
│   ├── page.tsx           # Listagem de posts
│   └── BlogClient.tsx     # Wrapper do cliente
├── loja/                  # Área pública da vitrine e inscrições
│   ├── carrinho/          # Visualização e gestão do carrinho de compras
│   ├── categorias/        # Filtros e páginas de cada categoria de produto
│   ├── checkout/          # Processo de pagamento e finalização do pedido
│   ├── cliente/           # Área do cliente com pedidos e dados pessoais
│   ├── login/             # Rotas de autenticação da loja
│   ├── components/        # Componentes reutilizáveis da loja
│   ├── eventos/           # Formulário de inscrição em eventos
│   ├── inscricoes/        # Envio e visualização pública (se necessário)
│   ├── produtos/          # Listagem e detalhes dos produtos
│   ├── layout.tsx         # Layout público da loja
│   └── page.tsx           # Home da loja
├── api/                  # Rotas de API e webhooks
├── components/           # Componentes compartilhados entre Loja, Admin e Blog
├── campos/               # Páginas sobre os campos de atuação
├── iniciar-tour/         # Passo a passo inicial para novos usuários
├── inscricoes/           # Formulário público de inscrições
├── login/                # Autenticação geral do sistema
├── layout.tsx             # Layout raiz compartilhado
├── page.tsx               # Loja do cliente
├── globals.css            # CSS global compartilhado
posts/                    # (legado) posts agora carregados da coleção `posts` do PocketBase
/scripts/                  # Scripts auxiliares
/stories/                  # Storybook de componentes
components/                # Componentes reutilizáveis compartilhados
lib/                     # Funções principais
lib/server/              # Utilidades do servidor
lib/flows/               # Fluxos de negócio
utils/                   # Utilitários do projeto
public/                  # Arquivos estáticos
types/                   # Definições TypeScript
__tests__/               # Testes automatizados
logs/                    # Registros de documentação e erros
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
  `/admin/obrigado`, `/admin/pendente`, `/admin/erro`,
  `/_/auth/password-reset` e `/_/auth/confirm-password-reset/[token]`,
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

---

## 📌 Considerações Finais

Esta estrutura busca garantir **clareza, escalabilidade e manutenibilidade** do projeto M24Vendas, atendendo tanto ao público final quanto às lideranças administrativas. Deve ser evoluída com base no crescimento do projeto, mantendo a consistência na organização e nos princípios de performance e segurança.
