# Saldo e Transferência Asaas

Este guia explica como consultar o saldo e realizar transferências usando as rotas `/api/asaas/saldo` e `/api/asaas/transferencia`.

## Pré-requisitos

1. **Permissões** – apenas coordenadores autenticados podem acessar essas rotas.
2. **externalReference** – todas as transações devem incluir um `externalReference` no formato `cliente_<idCliente>_usuario_<idUsuario>[_inscricao_<id>]`, conforme [docs/plano-negocio.md](./plano-negocio.md).
3. **Chave API** – a aplicação identifica o cliente pelo domínio em `clientes_config` e busca `asaas_api_key` e `asaas_account_id` em `m24_clientes` antes de contatar o Asaas, garantindo o isolamento multi-tenant.

## Consulta de Saldo

```bash
GET /api/asaas/saldo
```

Resposta:

```json
{ "balance": 1234.56 }
```

## Estatísticas de Cobranças

Utilize esta rota para obter valores agregados das cobranças no Asaas. Todos os
parâmetros enviados são repassados para `/finance/payment/statistics`.

```bash
GET /api/asaas/estatisticas?status=PENDING
```

Resposta:

```json
{ "quantity": 1, "value": 50, "netValue": 48.01 }
```

## Transferência de Saldo

Para contas bancárias:

```json
{
  "value": 150.75,
  "bankAccountId": "acc_123",
  "description": "Repasse loja junho/2025"
}
```

Para chaves PIX:

```json
{
  "value": 150.75,
  "pixAddressKey": "a@b.com",
  "pixAddressKeyType": "email",
  "operationType": "PIX",
  "description": "Repasse loja junho/2025",
  "scheduleDate": "2025-08-20" // opcional
}
```

A rota retorna o objeto da transferência criado pelo Asaas.

## Extrato de Movimentações

Na página **Saldo** é possível listar o extrato financeiro usando o endpoint `/api/asaas/extrato`. Utilize os botões **Exportar PDF** ou **Exportar XLSM** para salvar os dados.
Para filtrar, informe `start` e `end` (AAAA-MM-DD):

```bash
GET /api/asaas/extrato?start=2025-01-01&end=2025-01-31
```

Essa rota consulta `${ASAAS_API_URL}/financialTransactions`, aplicando os
parâmetros `offset=0`, `limit=10` e `order=asc`. A chave do cliente é obtida via
`requireClienteFromHost` e o mesmo `User-Agent` utilizado no saldo.
