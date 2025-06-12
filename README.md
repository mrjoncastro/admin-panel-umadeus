Este repositório reúne portal institucional, blog, loja virtual e painel administrativo em uma única aplicação Next.js.
Visitantes navegam pelo portal e pelo blog, realizam compras na loja e os coordenadores gerenciam tudo pelo admin.
Consulte [arquitetura.md](arquitetura.md) para entender a divisão de pastas e responsabilidades.
Para personalizar a interface utilize as orientações de [docs/design-system.md](docs/design-system.md).

## Primeiros Passos

Para iniciar o servidor de desenvolvimento execute:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para visualizar.
Você pode editar a página inicial em `app/page.tsx` e ver as alterações em tempo real.

Este projeto utiliza [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) para otimizar e carregar a fonte [Geist](https://vercel.com/font).

## Saiba Mais

Para saber mais sobre o Next.js consulte os recursos abaixo:

- [Documentação do Next.js](https://nextjs.org/docs) - funcionalidades e API.
- [Aprenda Next.js](https://nextjs.org/learn) - tutorial interativo.

Você também pode conferir o [repositório do Next.js no GitHub](https://github.com/vercel/next.js) para colaborar.

## Deploy na Vercel

A maneira mais simples de publicar a aplicação é utilizar a [Plataforma Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), criada pelos desenvolvedores do Next.js.

Consulte a [documentação de deploy do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para mais detalhes.

### Domínio próprio na Vercel

1. Instale a Vercel CLI com `npm i -g vercel` e execute `vercel` para vincular o projeto à sua conta.
2. No painel da Vercel, adicione o domínio desejado em **Settings > Domains**.
3. Defina a variável `NEXT_PUBLIC_SITE_URL` com o domínio configurado (ex.: `https://meuapp.com`).
4. Rode `vercel --prod` para publicar e aplique as configurações de DNS indicadas pela própria Vercel.

## Lint e boas práticas

Execute `npm run lint` para verificar problemas de código. Evite o uso de `any` especificando tipos adequados e sempre inclua todas as dependências utilizadas dentro dos hooks `useEffect`.
Antes de rodar o lint ou o TypeScript (`tsc`), execute `npm install` para garantir que todas as dependências estejam disponíveis.

## Funcionalidades Adicionais

- Sinal de notificações lista inscrições pendentes fora do cabeçalho.
- A navegação mobile inclui botão "voltar ao topo" para facilitar a rolagem.
- Formulários de busca de pedidos e inscrições se adaptam ao tipo de usuário, permitindo busca pelo nome do inscrito.
- Usuários podem alternar entre os temas claro e escuro.
- Toasts informam sucesso ou erro das ações.
- Tabelas e botões minimalistas mantêm a aparência consistente.
- O dashboard traz gráficos temporais de inscrições e pedidos, além de ticket médio e receita por campo para coordenadores e líderes.
- Os gráficos permitem filtrar por período e exportar os dados em CSV ou XLSX.

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
- `ASAAS_API_KEY` - (opcional) chave padrão da API do Asaas
- `ASAAS_WEBHOOK_SECRET` - segredo para validar webhooks do Asaas
- `ASAAS_API_URL` - URL base da API do Asaas (ex.: `https://api-sandbox.asaas.com/api/v3/`)
- `NEXT_PUBLIC_SITE_URL` - endereço do site (opcional)

Cada registro em `m24_clientes` contém o campo `asaas_api_key`. A aplicação busca a chave correta deste cliente antes de criar cobranças ou checkouts, garantindo que cada subconta do Asaas seja utilizada separadamente.

Esta integração realiza chamadas HTTP diretamente na API do Asaas, sem utilizar o SDK oficial.

## Conectando ao PocketBase

1. Defina `NEXT_PUBLIC_PB_URL` apontando para a URL onde o PocketBase está rodando, por exemplo:

2. Utilize as variáveis `PB_ADMIN_EMAIL` e `PB_ADMIN_PASSWORD` para autenticar a aplicação.

## Fluxo de Cadastro e Checkout

1. O usuário preenche o formulário e os dados são enviados para `criarInscricao`.
2. A função valida os campos e retorna uma inscrição com status `pendente`.
3. Em seguida `criarPedido` gera o pedido vinculado à inscrição.
4. Compras feitas na loja enviam o `pedidoId` para o endpoint `/checkouts`, que
   comunica-se com `/admin/api/asaas` para gerar a `url` de pagamento e salvá-la
   em `link_pagamento`.
5. O usuário é redirecionado para essa URL para concluir o pagamento.

### Inscrições x Compras na Loja

* **Inscrições** – após um líder confirmar a inscrição pelo admin, o painel faz
  uma chamada para `/admin/api/asaas` a fim de gerar o boleto e salvar o link de
  pagamento no pedido correspondente.
* **Compras de Loja** – os produtos adicionados ao carrinho são processados na
  página `/loja/checkout`. Esse fluxo usa `/admin/api/asaas/checkout` para
  criar um link de checkout do Asaas e redirecionar o usuário automaticamente.

### Endpoint `/admin/api/asaas/checkout`

Envie uma requisição `POST` em JSON contendo:

```json
{
  "valor": 99.9,
  "itens": [{ "name": "Produto", "quantity": 1, "value": 99.9 }],
  "successUrl": "https://meusite.com/sucesso",
  "errorUrl": "https://meusite.com/erro",
  "clienteId": "cli_123",
  "usuarioId": "user_456",
  "inscricaoId": "ins_789"
}
```

- **valor** – valor total em reais.
- **itens** – lista de itens (nome, quantidade e valor unitário).
- **successUrl** – página de redirecionamento em caso de aprovação.
- **errorUrl** – página de erro ou cancelamento.
- **clienteId** – ID do cliente (tenant) responsável pelo pagamento.
- **usuarioId** – ID do usuário que gerou o checkout.
- **inscricaoId** – ID da inscrição relacionada (opcional).

O endpoint utiliza as variáveis de ambiente `ASAAS_API_URL` e `ASAAS_API_KEY`.
A resposta contém o campo `link` com o URL gerado. O `externalReference` enviado ao Asaas segue o formato `cliente_<idCliente>_usuario_<idUsuario>[_inscricao_<id>]`:

```json
{ "link": "https://asaas.com/..." }
```

### Coleção `compras`

Registra as compras feitas na loja. Campos principais:

- `cliente` – relação obrigatória com o tenant.
- `usuario` – usuário que realizou a compra.
- `itens` – JSON com os produtos adquiridos.
- `valor_total` – soma dos itens.
- `status` – `pendente`, `pago` ou `cancelado`.
- `metodo_pagamento` – `pix`, `cartao` ou `boleto`.
- `checkout_url` – link de pagamento gerado (opcional).
- `asaas_payment_id` – ID da transação no Asaas (opcional).
- `externalReference` – identificador único enviado ao Asaas.
- `endereco_entrega` – dados de entrega (opcional).
- `created` / `updated` – gerenciados pelo PocketBase.

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
2. No menu lateral, clique em **Posts** e escolha **Novo Post** ou selecione um
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
