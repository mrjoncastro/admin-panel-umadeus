# M24 Monorepo

Este repositório segue arquitetura monorepo, centralizando múltiplos serviços e bibliotecas compartilhadas.

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

- O banco de dados Supabase deve ser criado e configurado previamente.
- Todos os serviços devem apontar para o Supabase/Postgres via variáveis de ambiente.
- Para desenvolvimento, utilize dados fictícios e policies de RLS para garantir isolamento.
