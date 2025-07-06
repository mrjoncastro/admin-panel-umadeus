# Plano de Cálculo de Cobranças e Repasse de Margens

Este documento descreve a lógica e as fórmulas que o sistema deve usar para calcular, emitir e registrar cobranças de inscrições de forma que:

1. **O coordenador receba exatamente o valor líquido** que cadastrou.
2. A plataforma retenha **margem líquida de 7%** sobre esse valor.
3. O Asaas aplique sua **taxa fixa** e/ou **percentual** sobre o valor bruto enviado.
4. Tudo seja calculado “ao contrário” (cálculo reverso) para encontrar o **valor bruto** a cobrar.

---

## 1. Tabela de Taxas Asaas

| Forma de Pagamento  | Taxa Fixa (F) | Taxa Percentual (P) |
| ------------------- | ------------- | ------------------- |
| **Pix**             | R\$ 1,99      | 0%                  |
| **Boleto**          | R\$ 1,99      | 0%                  |
| **Crédito à Vista** | R\$ 0,49      | 2,99% (0,0299)      |
| **Crédito 2–6x**    | R\$ 0,49      | 3,49% (0,0349)      |
| **Crédito 7–12x**   | R\$ 0,49      | 3,99% (0,0399)      |

---

## 2. Fórmula Geral (Cálculo Reverso)

Seja:

- **V** = valor líquido desejado pelo coordenador
- **M** = margem líquida (7% → 0,07)
- **F** = taxa fixa do Asaas (conforme tabela acima)
- **P** = taxa percentual do Asaas (conforme tabela acima)
- **G** = valor bruto a ser cobrado

Queremos que, após o Asaas descontar `F + P×G`, reste `(V × (1+M))` para dividir entre plataforma e coordenador. A equação é:

```
G × (1 - P) - F = V × (1 + M)
⇒
G = (V × (1 + M) + F) / (1 - P)
```

---

## 3. Processo no Sistema

1. **Entrada de Dados**

   - Coordenador cadastra preço líquido **V**.
   - Usuário final escolhe forma de pagamento e, se for cartão, número de parcelas.

2. **Determinação de F e P**

   - Buscar em configuração interna as taxas `F` e `P` conforme forma e parcelas.

3. **Cálculo do Valor Bruto G**

   ```ts
   const V = valorLiquidoDesejado
   const M = 0.07
   const { fixedFee: F, percentFee: P } = obterTaxas(forma, parcelas)

   const G = Number(((V * (1 + M) + F) / (1 - P)).toFixed(2))
   ```

4. **Montagem do Payload para Asaas**

   - `value`: deve ser `G` (valorBruto).
   - `split`: repassar **7% de V** para carteira da plataforma.

   ```ts
   split: [
     {
       walletId: process.env.WALLETID_M24,
       fixedValue: Number((V * M).toFixed(2)),
     },
   ]
   ```

5. **Envio e Registro**

   - Enviar payload ao Asaas.
   - No banco, salvar:
     - `valorBase = V`
     - `valorBruto = G`
     - `taxaAsaas = G - (V*(1+M))`
     - `margemPlataforma = V * M`
     - `formaPagamento`, `parcelas`

---

## 4. Exemplo Numérico

Para **Pix**, com V = R\$ 50,00:

- F = 1,99
- P = 0
- \(G = 50 × 1,07 + 1,99 = 53,50 + 1,99 = 55,49\)

**Fluxo:**

> **Observações finais**
>
> - Todos os valores devem ser arredondados a dois dígitos (centavos).
> - Esta lógica se aplica a **inscrições** (cobrança avulsa).
> - O sistema deve atualizar dinamicamente o valor de `G` e os detalhes de split sempre que o usuário alterar forma de pagamento ou número de parcelas.
> - Ao exibir o "Total a pagar", usar calculateGross(total, paymentMethod, installments), refletindo a forma de pagamento selecionada. O cálculo com "pix" pode ser usado como referência base ou subtotal comparativo.

Parcelado em 3x (Cartão 2–6x):

- P = 0,0349, F = 0,49
- \(G = (50×1,07 + 0,49) / (1 - 0,0349) ≈ 56,06\)
- Valor da parcela ≈ R\$ 18,69 (56,06 ÷ 3)

---

## 5. Tabela de Acréscimos Estimados

| Pagamento         | Fórmula do Bruto G           | Exemplo G (V=50) |
| ----------------- | ---------------------------- | ---------------- |
| **Pix/Boleto**    | G = V·1,07 + 1,99            | R\$ 55,49        |
| **Crédito 1x**    | G = (V·1,07 + 0,49) / 0,9701 | R\$ 56,15        |
| **Crédito 2–6x**  | G = (V·1,07 + 0,49) / 0,9651 | R\$ 56,06        |
| **Crédito 7–12x** | G = (V·1,07 + 0,49) / 0,9601 | R\$ 56,00        |

---

> **Observações finais**
>
> - Todos os valores devem ser arredondados a dois dígitos (centavos).
> - Esta lógica se aplica tanto a **inscrições** (cobrança avulsa) quanto a **compras** (checkout).
> - O sistema deve atualizar dinamicamente o valor de `G` e os detalhes de split sempre que o usuário alterar forma de pagamento ou número de parcelas.
> - O valor bruto calculado para qualquer forma de crédito (à vista ou parcelado) não pode ser inferior ao valor bruto calculado para Pix; se ocorrer, utilize o valor do Pix como valor mínimo.
> - O sistema deve atualizar dinamicamente o valor de G e os detalhes de split sempre que o usuário alterar forma de pagamento ou número de parcelas.
