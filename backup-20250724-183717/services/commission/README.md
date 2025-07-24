# Commission Engine PoC

Serviço responsável pelo cálculo de comissões multi-nível, conforme guia PoC.

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

## Rota principal
- `POST /calculate` – Calcula o valor bruto e o split de comissões

## Exemplo de Query Multi-Tenant
```sql
SELECT * FROM commission_transactions WHERE cliente = '<tenant_id>';
```

## Exemplo de payload
```json
{
  "cost": 100,
  "salePrice": 150,
  "paymentMethod": "pix",
  "installments": 1
}
``` 