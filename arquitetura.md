# 📁 Estrutura de Projeto – M24Vendas

Este documento descreve a **arquitetura de pastas e responsabilidades** do projeto M24Vendas, com orientações baseadas em **boas práticas de desenvolvimento, organização e performance**.

---

## 🧭 Visão Geral

O projeto é dividido logicamente em quatro áreas:

| Área        | Função Principal                         | Acesso            | Público-alvo            |
|-------------|-------------------------------------------|-------------------|-------------------------|
| **Loja**    | Página pública para venda e inscrições    | Público           | Visitantes e inscritos  |
| **Admin**   | Painel de gestão e controle de dados      | Privado (auth)    | Coordenadores e líderes |
| **Blog**    | Página pública para postagens de conteúdo | Público           | Visitantes e inscritos  |
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
├── 
├── layout.tsx             # Layout raiz compartilhado
├── page.tsx               # Loja do cliente
├── globals.css            # CSS global compartilhado
/posts/                    # Conteúdo do blog em arquivos .mdx
/scripts/                  # Scripts auxiliares
/stories/                  # Storybook de componentes

---
# Estrutura Multi-tenant PocketBase — m

Implementamos a base multi-tenant do sistema no banco usando PocketBase, já preparada para isolamento de dados entre diferentes clientes (tenants) desde o desenvolvimento.

## Estrutura das Coleções

### 1. m24_clientes
- Cadastro central de cada cliente/união (tenant).
- Campo `documento` (CPF ou CNPJ) obrigatório e único, para identificação fiscal e integrações.
- Demais campos: `nome`, `dominio`, `logo_url`, `cor_primaria`, `responsavel_nome`, `responsavel_email`, `ativo`, `created`.

### 2. Coleções filhas (usuarios, produtos, pedidos, inscricoes)
- Todas possuem campo de relação obrigatória `cliente` (referência à coleção `clientes`).
- Isso garante que todo registro esteja sempre vinculado a um cliente.

## Permissões e Lógica Multi-tenant 

- Todas queries, leituras e gravações devem ser filtradas pelo campo `cliente`.
- **É obrigatório que toda criação, edição, atualização ou exclusão de usuários, pedidos, inscrições, compras e quaisquer outros registros SEMPRE inclua o campo `cliente`, vinculando corretamente ao cliente (tenant) em questão.**
- O fluxo de autenticação, consulta ou cadastro deve sempre:
  1. **Procurar primeiro o cliente** (tenant) usando `documento` (CPF/CNPJ) ou domínio.
  2. **Isolar todas as operações** usando o ID do cliente (campo `cliente`).
  3. Garantir que cada usuário veja/edite apenas dados do seu próprio cliente (tenant).

> **Exemplo de filtro em query:**  
> Buscar pedidos apenas do cliente autenticado:
> ```js
> pb.collection('pedidos').getFullList({ filter: `cliente='ID_DO_CLIENTE'` })
> ```

- O escopo do usuário (coordenador, lider, usuario) deve ser respeitado dentro do tenant.

## Benefícios

- Estrutura pronta para SaaS: escalável, segura, pronta para deploy em nuvem.
- Fácil integração com pagamentos, notas fiscais e automações.
- Permissões e isolamento já padronizados desde o desenvolvimento local.

---

> Adote este padrão multi-tenant em toda a aplicação, SEMPRE consultando, criando e isolando pelo cliente antes de qualquer outra operação — isso inclui obrigatoriamente toda criação, edição e atualização de registros nas coleções filhas. Assim, a transição para produção será transparente e segura.



## 🌐 Site – Boas Práticas

- Mantém a identidade visual do cliente de forma *white label*
- Permite customização de logo e cores via painel admin (`/admin/configuracoes`)
- Integra navegação para Loja, Admin e Blog
- Detalhes em [docs/design-system.md](docs/design-system.md#personalizacao)

## 🛍️ Loja – Boas Práticas

- Roteamento claro e semântica amigável (ex: `/loja/produtos/kit-jovem`)
- SEO: uso de metadados dinâmicos e URLs limpas
- Utilizar `next export` para páginas estáticas
- Separar lógica de exibição (componentes) da lógica de dados (lib/services)
- Formulários com validação (Zod ou HTML5) + feedback visual
- Responsivo (mobile-first) com Tailwind

## ✍️ Blog – Boas Práticas
- Conteúdo em `/posts` no formato MDX
- Componentes em `app/blog/components`
- Utilize `BlogClient.tsx` para carregar posts no cliente
---

## 🛠️ Admin – Boas Práticas

- Rotas protegidas com `useAuthGuard` e validação de `role`
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
- Dividir código entre `/lib`, `/services` e `/hooks` para clareza
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
