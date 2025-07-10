# Especificação da Coleção: commission_transactions (PocketBase)

Esta coleção irá gerenciar o histórico e os detalhes das transações de comissão geradas pelo Commission Engine.

## Campos Sugeridos

| Campo              | Tipo         | Obrigatório | Descrição                                                        |
|--------------------|--------------|-------------|------------------------------------------------------------------|
| id                 | text (UUID)  | sim         | Identificador único da transação                                 |
| pedido_id          | text         | sim         | ID do pedido relacionado                                         |
| user_id            | text         | sim         | ID do usuário responsável pela transação                         |
| valor_bruto        | number       | sim         | Valor bruto calculado                                            |
| fee_fixed          | number       | sim         | Taxa fixa aplicada (Asaas)                                       |
| fee_percent        | number       | sim         | Taxa percentual aplicada (Asaas)                                 |
| split              | json         | sim         | Array com detalhes do split (fornecedor, vendedor, host, plataforma) |
| payment_method     | text         | sim         | Método de pagamento (pix, boleto, credit)                        |
| installments       | number       | não         | Número de parcelas                                               |
| status             | text         | sim         | Status da transação (pendente, concluída, falha, etc)            |
| created            | date         | sim         | Data/hora de criação                                             |
| updated            | date         | não         | Data/hora de atualização                                         |

## Exemplo de Documento

```json
{
  "id": "uuid-gerado",
  "pedido_id": "pedido-123",
  "user_id": "usuario-456",
  "valor_bruto": 150.00,
  "fee_fixed": 2.5,
  "fee_percent": 0.025,
  "split": [
    { "wallet": "fornecedor", "value": 100 },
    { "wallet": "vendedor", "value": 30 },
    { "wallet": "host", "value": 8 },
    { "wallet": "plataforma", "value": 12 }
  ],
  "payment_method": "boleto",
  "installments": 1,
  "status": "pendente",
  "created": "2024-06-01T12:00:00Z",
  "updated": "2024-06-01T12:00:00Z"
}
```

## Observações
- O campo `split` pode ser expandido para incluir IDs de carteiras, percentuais e outros metadados.
- O campo `status` pode ser atualizado conforme o fluxo de pagamento e repasse.
- Recomenda-se criar índices em `pedido_id` e `user_id` para facilitar buscas e relatórios.

---

> Esta coleção deve ser criada no PocketBase via painel admin ou script de migração. 