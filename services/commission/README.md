# Commission Engine PoC

Serviço responsável pelo cálculo de comissões multi-nível, conforme guia PoC.

## Rota principal
- `POST /calculate` – Calcula o valor bruto e o split de comissões

## Exemplo de payload
```json
{
  "cost": 100,
  "salePrice": 150,
  "paymentMethod": "pix",
  "installments": 1
}
``` 