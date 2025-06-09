This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Domínio próprio na Vercel

1. Instale a Vercel CLI com `npm i -g vercel` e execute `vercel` para vincular o projeto à sua conta.
2. No painel da Vercel, adicione o domínio desejado em **Settings > Domains**.
3. Defina a variável `NEXT_PUBLIC_SITE_URL` com o domínio configurado (ex.: `https://meuapp.com`).
4. Rode `vercel --prod` para publicar e aplique as configurações de DNS indicadas pela própria Vercel.

## Lint e boas práticas

Execute `npm run lint` para verificar problemas de código. Evite o uso de `any` especificando tipos adequados e sempre inclua todas as dependências utilizadas dentro dos hooks `useEffect`.
Antes de rodar o lint ou o TypeScript (`tsc`), execute `npm install` para garantir que todas as dependências estejam disponíveis.

## Additional Features

- Interactive notification bell lists pending sign-up names and fields outside
  the header.
- Mobile navigation includes a "back to top" button for easier scrolling.
- Search forms for orders and registrations adapt to the user role and allow
  busca pelo nome do inscrito.
- Users can switch between light and dark themes.
- Toast notifications inform success or error of actions.
- Minimalist tables and buttons for a consistent look.
- Dashboard now includes temporal charts showing sign-up and order evolution,
  along with average order value and revenue per field for coordinators and
  leaders.
 - Analytics charts support date range filters and allow exporting the data as
    CSV or XLSX spreadsheets.

## Design System

Nosso design system centraliza cores, tipografia e espaçamentos em `globals.css`
e `tailwind.config.js`, garantindo consistência visual em todo o painel. Os
principais componentes possuem exemplos no Storybook para facilitar testes e
documentação.

Leia as diretrizes completas em [docs/design-system.md](docs/design-system.md)
e consulte a tabela de tokens em
[docs/design-tokens.md](docs/design-tokens.md).
Esses documentos também trazem exemplos das classes globais `btn` e
`input-base` utilizadas em formulários.

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz e defina as seguintes variáveis:

- `NEXT_PUBLIC_PB_URL` - URL do PocketBase
- `PB_ADMIN_EMAIL` - e-mail do administrador do PocketBase
- `PB_ADMIN_PASSWORD` - senha do administrador
- `ASAAS_API_KEY` - chave da API do Asaas para geração de pagamentos
- `ASAAS_WEBHOOK_SECRET` - segredo para validar webhooks do Asaas
- `ASAAS_API_URL` - URL base da API do Asaas (ex.: `https://sandbox.asaas.com/api/v3/`)
- `NEXT_PUBLIC_SITE_URL` - endereço do site (opcional)

Esta integração realiza chamadas HTTP diretamente na API do Asaas, sem utilizar o SDK oficial.

## Conectando ao PocketBase


1. Defina `NEXT_PUBLIC_PB_URL` apontando para a URL onde o PocketBase está rodando, por exemplo:


2. Utilize as variáveis `PB_ADMIN_EMAIL` e `PB_ADMIN_PASSWORD` para autenticar a aplicação.

## Fluxo de Cadastro e Checkout

1. O usuário preenche o formulário e os dados são enviados para `criarInscricao`.
2. A função valida os campos e retorna uma inscrição com status `pendente`.
3. Em seguida `criarPedido` gera o pedido vinculado à inscrição.
4. A API `/admin/api/asaas` recebe o `pedidoId` e devolve a `url` de pagamento,
   que é salva em `link_pagamento`.
5. O usuário é redirecionado para essa URL para concluir o pagamento.

## Perfis de Acesso

O sistema possui três níveis de usuário:

- **Coordenador** – acesso total ao painel administrativo.
- **Lider** – acesso restrito às inscrições e pedidos do seu campo.
- **Usuário** – cliente final que realiza compras e visualiza a área do cliente em `/loja/cliente`.

## Blog e CMS

Os arquivos de conteúdo ficam dentro da pasta `posts/` na raiz do projeto. Cada
arquivo `.mdx` representa um post do blog.

Para criar ou editar posts pelo painel admin:

1. Acesse `/admin` e realize o login.
2. No menu lateral, clique em **Blog** e escolha **Novo Post** ou selecione um
   existente para editar.
3. Preencha título, resumo, categoria, autor, data de publicação, caso seja uma edição informe: post editado por {autor}, em {data de edição}, thumbnail e o conteúdo em Markdown.
4. Salve para publicar ou atualizar o post.

Após salvar as alterações, execute o comando abaixo para gerar
`/public/posts.json` com a lista de posts:

```bash
npm run generate-posts
```


## Testes

Execute `npm run lint` e `npm run test` para validar o projeto.
Consulte [docs/testes.md](docs/testes.md) para instruções completas.

## Build

Para gerar o build de produção execute:

```bash
npm run build
```

## Registro de Logs

Os arquivos dentro do diretório `logs/` guardam o histórico do projeto.

- `logs/DOC_LOG.md` registra alterações de documentação e processos.
- `logs/ERR_LOG.md` armazena erros ocorridos e como foram corrigidos.

Para adicionar uma nova entrada, abra o arquivo correspondente e inclua uma linha no formato:

```
## [DATA] Descrição - ambiente - [link do commit]
```

Mais orientações podem ser encontradas em [AGENTS.md](AGENTS.md).
