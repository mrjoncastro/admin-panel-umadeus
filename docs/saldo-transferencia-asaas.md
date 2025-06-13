# Saldo e Transferência Asaas

Este guia explica como consultar o saldo e realizar transferências usando as rotas `/admin/api/asaas/saldo` e `/admin/api/asaas/transferencia`.

## Pré-requisitos

1. **Permissões** – apenas coordenadores autenticados podem acessar essas rotas.
2. **externalReference** – todas as transações devem incluir um `externalReference` no formato `cliente_<idCliente>_usuario_<idUsuario>[_inscricao_<id>]`, conforme [docs/plano-negocio.md](./plano-negocio.md).
3. **Chave API** – a aplicação busca a `asaas_api_key` da subconta do cliente (tenant) antes de contatar o Asaas, garantindo o isolamento multi-tenant.

## Consulta de Saldo

```bash
GET /admin/api/asaas/saldo
```

Resposta:

```json
{ "saldo": 1234.56 }
```

## Transferência de Saldo

```json
{
  "valor": 150.75,
  "bankAccountId": "acc_123",
  "descricao": "Repasse loja junho/2025"
}
```

A rota retorna o objeto da transferência criado pelo Asaas.

## Extrato de Movimentações

Na página **Saldo** é possível listar o extrato financeiro usando o endpoint `/admin/api/asaas/extrato`. Utilize os botões **Exportar PDF** ou **Exportar XLSM** para salvar os dados.
