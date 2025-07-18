# M24 Monorepo

Este repositório segue arquitetura monorepo, centralizando múltiplos serviços e bibliotecas compartilhadas.

---

## 🚀 Instalação e Configuração do Ambiente

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (recomendado v18+)
- [pnpm](https://pnpm.io/) (ou npm/yarn)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (para rodar o Supabase localmente)

### 2. Instale o Supabase CLI (Windows recomendado via Scoop)
```sh
# Se já tem Scoop:
scoop install supabase
# Se não tem Scoop:
Set-ExecutionPolicy RemoteSigned -scope CurrentUser
irm get.scoop.sh | iex
scoop install supabase
```
Ou baixe o binário em: https://github.com/supabase/cli/releases

### 3. Instale as dependências do projeto
```sh
pnpm install
# ou
npm install
# ou
yarn
```

### 4. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com:
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<sua-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<sua-service-role-key>
POSTGRES_PASSWORD=example
POSTGRES_DB=catalog
```
As chaves do Supabase podem ser obtidas no painel do Supabase Cloud ou no `.env` gerado pelo Supabase CLI após rodar `supabase start`.

### 5. Suba o Supabase localmente
```sh
supabase start
```
Isso irá iniciar todos os containers necessários (Postgres, API, Auth, Studio, Storage).

- Acesse o Studio: http://localhost:54322
- API REST: http://localhost:54321

### 6. Suba os serviços essenciais do monorepo
```sh
docker-compose up
```
Isso irá subir gateway (Next.js), redis, etc. O banco de dados já estará disponível via Supabase.

### 7. Acesse a aplicação
- Next.js: http://localhost:3000
- Supabase Studio: http://localhost:54322

---

## Estrutura

- `services/gateway/` – Next.js (portal, admin, loja, blog)
- `services/catalog/` – Catálogo de produtos e categorias (Supabase/Postgres)
- `services/orders/` – Pedidos (Supabase/Postgres)
- `services/commission/` – Engine de comissão (Supabase/Postgres)
- `libs/types/` – Tipagens TypeScript compartilhadas
- `libs/utils/` – Utilitários e hooks
- `libs/design-tokens/` – Tokens de design (cores, espaçamentos, fontes)

## Multi-tenancy & Theming

- Multi-tenancy via domínio (middleware e API `/api/tenant`)
- Theming dinâmico: tokens em `libs/design-tokens/` e configurações em `clientes_config`

## Banco de Dados

- **Supabase/Postgres**: banco principal para todos os serviços (produtos, pedidos, usuários, comissões, etc.)
- RLS (Row Level Security) e policies para isolamento multi-tenant
- Scripts de criação em `docs/v2/supabase_schema.sql`

## Variáveis de Ambiente (exemplo)

```env
# Supabase/Postgres
POSTGRES_HOST=<host do supabase>
POSTGRES_PORT=5432
POSTGRES_DB=<nome do banco>
POSTGRES_USER=<usuário>
POSTGRES_PASSWORD=<senha>
```

## Comandos úteis

```sh
# Instalar dependências
pnpm install

# Subir serviços (exceto banco, que é Supabase)
docker compose up --build

# Parar todos os serviços
docker compose down

# Ver status dos serviços
docker compose ps
```

## Exemplo de Query Multi-Tenant

```sql
SELECT * FROM produtos WHERE cliente = '<tenant_id>';
```

## Documentação

- [docs/v2/supabase_schema.sql](docs/v2/supabase_schema.sql): script de criação do schema no Supabase
- [docs/v2/arquitetura_deploy_escalabilidade.md](docs/v2/arquitetura_deploy_escalabilidade.md): arquitetura, deploy, escalabilidade
- [docs/v2/documento_estrategico_de_desenvolvimento.md](docs/v2/documento_estrategico_de_desenvolvimento.md): diretrizes estratégicas

## Observações

- O banco de dados Supabase deve ser criado e configurado previamente (ou rodar local via CLI).
- Todos os serviços devem apontar para o Supabase/Postgres via variáveis de ambiente.
- Para desenvolvimento, utilize dados fictícios e policies de RLS para garantir isolamento.
- Nunca exponha a SUPABASE_SERVICE_ROLE_KEY no frontend.
