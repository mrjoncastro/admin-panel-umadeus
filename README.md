Este repositório reúne portal institucional, blog, loja virtual e painel administrativo em uma única aplicação Next.js.
Visitantes navegam pelo portal e pelo blog, realizam compras na loja e os coordenadores gerenciam tudo pelo admin.
Consulte [arquitetura.md](arquitetura.md) para entender a divisão de pastas e responsabilidades.
O diretório `components/` na raiz concentra elementos reutilizáveis entre Loja, Admin e Blog.
Para personalizar a interface utilize as orientações de [docs/design-system.md](docs/design-system.md).
As preferências de fonte, cor, logotipo e confirmação de inscrições ficam nos campos `font`, `cor_primary`, `logo_url` e `confirma_inscricoes` da coleção `clientes_config`.
Para um passo a passo inicial do sistema consulte [docs/iniciar-tour.md](docs/iniciar-tour.md).
Coordenadores podem iniciar o tour clicando no ícone de mapa ao lado do sino de notificações no painel admin ou acessando `/iniciar-tour` diretamente.

## Page Builder

A página inicial pode ser montada dinamicamente. As seções são configuradas em
`/admin/page-builder/home` e consumidas pela rota `/api/home-sections`.

## Diretórios Principais

- `app/` - rotas e páginas
- `components/` - compartilhados
- `lib/` - funções de apoio
  - `lib/flows/` - fluxos de negócio
  - `lib/server/` - utilidades do servidor
- `scripts/` - comandos auxiliares
- `stories/` - Storybook
- `__tests__/` - testes automatizados
- `logs/` - histórico de documentação e erros

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
3. Rode `vercel --prod` para publicar e aplique as configurações de DNS indicadas pela própria Vercel.

## Lint e boas práticas

**Importante:** execute `npm install` **antes** de rodar `npm run lint` ou `npm run build` para que todas as dependências (como **Next** e **Vitest**) estejam instaladas.

Execute `npm run lint` para verificar problemas de código. Evite o uso de `any` especificando tipos adequados e sempre inclua todas as dependências utilizadas dentro dos hooks `useEffect`.

## Funcionalidades Adicionais

- Sinal de notificações lista inscrições pendentes fora do cabeçalho.
- A navegação mobile inclui botão "voltar ao topo" para facilitar a rolagem.
- Formulários de busca de pedidos e inscrições se adaptam ao tipo de usuário, permitindo busca pelo nome do inscrito.
- Usuários podem alternar entre os temas claro e escuro.
- Toasts são o padrão de feedback, informando sucesso ou erro das ações.
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

- `PB_URL` - URL do PocketBase (obrigatório; em desenvolvimento usa `http://127.0.0.1:8090` caso esteja ausente)
- `PB_ADMIN_EMAIL` - e-mail do administrador do PocketBase
- `PB_ADMIN_PASSWORD` - senha do administrador
- `ASAAS_API_URL` - URL base da API do Asaas (ex.: `https://api-sandbox.asaas.com/api/v3/`)
- `NEXT_PUBLIC_BRASILAPI_URL` - base para chamadas à BrasilAPI
- `NEXT_PUBLIC_N8N_WEBHOOK_URL` - URL do webhook do n8n para receber inscrições
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM` - credenciais SMTP padrão para envio de e-mails (definidas em `clientes_config`; para `SMTP_USER` e `SMTP_PASS` solicite acesso ao administrador do PocketBase)

Os servidores identificam automaticamente o tenant **priorizando o domínio** de cada requisição por meio da função `getTenantFromHost`, que consulta a coleção `clientes_config` para descobrir o ID do cliente.

Com esse ID, o backend acessa `m24_clientes` e obtém as credenciais `asaas_api_key` e `asaas_account_id` da subconta correspondente, garantindo que cada domínio utilize sua própria chave Asaas.

Esta integração realiza chamadas HTTP diretamente na API do Asaas, sem utilizar o SDK oficial.
Quando não há domínio configurado (ex.: durante testes em localhost), defina manualmente o cookie `tenantId` com o ID do cliente ou cadastre o domínio em `clientes_config` para que rotas como `/api/produtos` funcionem corretamente.

Ao abrir páginas que utilizam informações do cliente (checkout, dashboard etc.), o frontend faz uma requisição GET para `/api/tenant` logo no carregamento. Essa rota serve apenas para **confirmar** o ID detectado via domínio e garantir que o cookie `tenantId` permaneça sincronizado com o servidor.

## Conectando ao PocketBase

1. Defina `PB_URL` apontando para a URL onde o PocketBase está rodando, por exemplo. Se ela não estiver definida, o painel tentará usar `http://127.0.0.1:8090` em ambientes de desenvolvimento:

2. Utilize as variáveis `PB_ADMIN_EMAIL` e `PB_ADMIN_PASSWORD` para autenticar a aplicação.
3. **Sempre chame o PocketBase através das rotas internas (`/api/*` ou `/admin/api/*`).**
   Dessa forma todas as requisições ocorrem no mesmo domínio e os cookies de autenticação
   são enviados corretamente, eliminando erros de CORS.

## Fluxo de Cadastro e Checkout

1. O usuário preenche o formulário e os dados são enviados para `criarInscricao`.
2. A função valida os campos e retorna uma inscrição com status `pendente`.
3. Em seguida `criarPedido` só é finalizado se a chamada ao Asaas retornar com
   sucesso, salvando `link_pagamento`. O campo `canal` recebe `inscricao` para
   indicar a origem do pedido.
4. Compras feitas na loja chamam primeiro `/api/asaas/checkout`; o pedido
   é criado somente após receber o `link` do Asaas, garantindo registros
   válidos.
5. O usuário é redirecionado para essa URL para concluir o pagamento.

### Inscrições x Compras na Loja

- **Inscrições** – após um líder confirmar a inscrição pelo admin, o painel faz
  uma chamada para `/api/asaas` informando `valorBruto`, `paymentMethod`
  e `installments` para gerar o boleto e salvar o link de pagamento no pedido
  correspondente.
- Para o passo a passo completo do modo manual consulte
  [docs/manual-aprovacao-inscricao.md](docs/manual-aprovacao-inscricao.md).
- **Compras de Loja** – os produtos adicionados ao carrinho são processados na
  página `/loja/checkout`. Esse fluxo usa `/api/asaas/checkout` para
  criar um link de checkout do Asaas e redirecionar o usuário automaticamente.

### Endpoint `/api/asaas/checkout`

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
- **canal** – origem do pedido (ex.: `inscricao`).
- **inscricaoId** – ID da inscrição relacionada (opcional).

O endpoint utiliza as variáveis de ambiente `ASAAS_API_URL` e `ASAAS_API_KEY`.
A resposta contém o campo `link` com o URL gerado. O `externalReference` enviado ao Asaas segue o formato `cliente_<idCliente>_usuario_<idUsuario>[_inscricao_<id>]`:

```json
{ "link": "https://asaas.com/..." }
```

### Endpoint `/api/asaas/saldo`

Faça uma requisição `GET` para obter o saldo da subconta do cliente atual:

```bash
GET /api/asaas/saldo
```

Resposta de exemplo:

```json
{ "balance": 1234.56 }
```

### Endpoint `/api/asaas/estatisticas`

Consulta estatísticas de cobranças através de `/finance/payment/statistics`.
Todos os parâmetros da requisição são repassados ao Asaas, permitindo filtros
como `status`, `billingType` e datas.

```bash
GET /api/asaas/estatisticas?status=PENDING
```

Resposta de exemplo:

```json
{ "quantity": 1, "value": 50, "netValue": 48.01 }
```

### Endpoint `/api/asaas/transferencia`

Envia uma transferência do saldo do Asaas para a conta bancária cadastrada. Requisição `POST` com o seguinte payload:

Para contas bancárias:

```json
{
  "value": 150.75,
  "bankAccountId": "acc_123",
  "description": "Repasse loja junho/2025"
}
```

Para PIX:

```json
{
  "value": 150.75,
  "pixAddressKey": "a@b.com",
  "pixAddressKeyType": "email",
  "operationType": "PIX",
  "description": "Repasse loja junho/2025",
  "scheduleDate": "2025-08-20"
}
```

- **value** – valor a transferir em reais.
- **bankAccountId** – código da conta bancária de destino (quando conta bancária).
- **pixAddressKey** – chave PIX de destino.
- **pixAddressKeyType** – tipo da chave PIX (`cpf`, `email`, `phone` etc.).
- **description** – texto opcional para identificar a transferência.
- **scheduleDate** – data de agendamento (opcional e apenas para PIX).

Essas rotas utilizam a chave do Asaas de cada cliente (tenant) conforme descrito em [docs/plano-negocio.md](docs/plano-negocio.md).

### Endpoint `/admin/api/asaas/extrato`

Retorna as movimentações financeiras do período informado:

```bash
GET /admin/api/asaas/extrato?start=2025-01-01&end=2025-01-31
```

Resposta de exemplo:

```json
{ "data": [] }
```

Use `start` e `end` (AAAA-MM-DD) para filtrar o período. A rota usa
`requireClienteFromHost` para obter a chave do cliente, define o `User-Agent`
e consulta `${ASAAS_API_URL}/financialTransactions` com os parâmetros padrão
`offset=0`, `limit=10` e `order=asc`, enviando os mesmos cabeçalhos utilizados
em `/api/asaas/saldo`.

### Cadastro de Contas Bancárias

O painel possui o modal `BankAccountModal` para registrar contas bancárias do cliente. O formulário possui campos **Nome do titular** (`ownerName`) e **Nome da conta** (`accountName`) para identificar a conta cadastrada. O campo **Banco** possui filtragem que consulta a BrasilAPI (`NEXT_PUBLIC_BRASILAPI_URL`); quando vazio, apresenta uma lista inicial com quinze bancos. Ao escolher um banco, `bankCode` e `ispb` são preenchidos automaticamente (este último fica oculto no formulário). Agora é possível alternar entre **Conta Bancária** e **PIX** por meio de abas com `SmoothTabs`. Quando selecionado PIX, o modal exibe os campos `pixAddressKey`, `pixAddressKeyType`, `description` e `scheduleDate`. O envio salva na coleção `clientes_pix` ou `clientes_contas_bancarias` conforme o tipo escolhido. A seleção de tipo de conta inclui a opção **Conta Salário**.
Na página **Transferências**, um botão **Nova conta** abre este modal para facilitar o cadastro durante o fluxo de transferências. O `ModalAnimated` recebeu um `z-index` superior para evitar que elementos fixos como a navbar sobreponham o conteúdo do modal.
Agora também é possível **editar** ou **excluir** contas existentes. Utilize as rotas
`/admin/api/bank-accounts/[id]` e `/admin/api/pix-keys/[id]` para atualizar ou
remover registros conforme o tipo.

### Endpoint `/api/upload-image`

Envie um `POST` contendo o arquivo no corpo (campo `file`). O servidor converte
o arquivo para WebP com `sharp`, salva em `public/uploads` e retorna:

```json
{ "urlWebp": "/uploads/arquivo.webp" }
```

## Tipos de Produto e Fluxos de Venda

Existem três formatos principais de produtos:

1. **Independente** – vendido diretamente na loja. O pedido gerado recebe o campo `canal` igual a `loja`.
2. **Vinculado a evento (sem aprovação)** – criado a partir de um evento que não exige aprovação. O pedido é gerado automaticamente e `canal` passa a ser `inscricao`.
3. **Vinculado a evento (com aprovação)** – associado a um evento onde `confirmaInscricoes` está habilitado. O usuário vê a mensagem "Requer inscrição aprovada" e o botão de compra permanece desativado até a aprovação.

O campo `canal` indica a **origem do pedido**, sendo `loja` para produtos independentes e `inscricao` quando o pedido se origina de uma inscrição (automática ou aprovada).

O fluxograma completo está disponível em [docs/fluxos.md](docs/fluxos.md).

## Perfis de Acesso

O sistema possui três níveis de usuário:

- **Coordenador** – acesso total ao painel administrativo.
- **Lider** – acesso restrito às inscrições e pedidos do seu campo.
- **Usuário** – cliente final que realiza compras e visualiza a área do cliente em `/loja/cliente`.

Coordenadores visualizam as métricas financeiras completas no painel.
Líderes veem apenas a quantidade de inscrições e pedidos do seu campo.

Para detalhes completos sobre visualização das inscrições, consulte [docs/regras-inscricoes.md](docs/regras-inscricoes.md). Já as regras de geração e acompanhamento de pedidos estão em [docs/regras-pedidos.md](docs/regras-pedidos.md).

## Blog e CMS

Os posts agora ficam na coleção `posts` do PocketBase, em vez de arquivos `.mdx`.

Para criar ou editar um post pelo painel admin:

1. Acesse `/admin` e realize o login.
2. No menu lateral, clique em **Posts** e escolha **Novo Post** ou selecione um existente.
3. Preencha os campos recomendados (`title`, `slug`, `summary`, `content`, `category`, `thumbnail`, `keywords`, `date`, `cliente` etc.).
4. Salve para publicar ou atualizar.

O front-end consome os posts diretamente do banco, portanto não é mais necessário executar `generate-posts`.

## Testes

Execute `npm run lint`, `npm run test` e `npm run a11y` para validar o projeto.
Consulte [docs/testes.md](docs/testes.md) para instruções completas.

## Build

Antes de rodar `npm run build`, execute `npm install` para instalar as dependências.

Para gerar o build de produção execute:

```bash
npm run build
```

## Gerar índice de funções

O repositório inclui o script `scripts/generate-index.ts` que mapeia todas as
funções e componentes exportados em `app/`, `lib/` e `components/`.

Execute o comando abaixo após instalar as dependências para gerar o arquivo
`docs/function-index.md`:

```bash
npx ts-node scripts/generate-index.ts
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
