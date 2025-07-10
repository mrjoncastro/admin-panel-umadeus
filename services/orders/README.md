# Orders Service

Microserviço responsável pela gestão de pedidos no M24 Admin Panel.

## Banco de Dados
- Supabase/Postgres
- Multi-tenancy via campo `cliente`
- RLS e policies para isolamento de dados

## Variáveis de Ambiente
```env
POSTGRES_HOST=<host do supabase>
POSTGRES_PORT=5432
POSTGRES_DB=<nome do banco>
POSTGRES_USER=<usuário>
POSTGRES_PASSWORD=<senha>
```

## Rotas principais
- `POST /orders` – Criar pedido
- `GET /orders` – Listar pedidos
- `PATCH /orders/:id` – Atualizar status do pedido

## Exemplo de Query Multi-Tenant
```sql
SELECT * FROM pedidos WHERE cliente = '<tenant_id>';
```

## Integração
- Integra com o Commission Engine para cálculo de comissões. 