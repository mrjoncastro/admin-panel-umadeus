# ✅ Aprovação Manual da Inscrição – Codex

Este documento detalha as **duas possibilidades de ação manual** sobre uma inscrição no painel administrativo, quando `confirma_inscricoes = true`.

---

## 📌 Opções de Ação Manual

### ✅ 1. Confirmar Inscrição

> Aprova a inscrição e inicia o fluxo de pagamento.

#### Regras:

- A cor deve ser extraída do campo `cores` do produto (coleção `produtos`). Caso haja mais de uma, utilizar a primeira cor como padrão (ex: `produto.cores[0]`).

```ts
// Exemplo de extração da cor do produto e montagem do array
const coresSelecionadas =
  Array.isArray(produto.cores) && produto.cores.length > 0
    ? [produto.cores[0]]
    : ['Roxo'] // fallback padrão

const pedidoPayload = {
  id_inscricao: inscricao.id,
  produto: [produto.id], // IDs enviados em array
  cores: coresSelecionadas,
  tamanho:
    inscricao.tamanho ??
    (Array.isArray(produto.tamanhos) ? produto.tamanhos[0] : 'M'),
  genero:
    inscricao.genero ??
    (Array.isArray(produto.generos) ? produto.generos[0] : 'feminino'),
  email: inscricao.email,
  valor: produto.preco_bruto,
  status: 'pendente',
  campo: campo?.id,
  responsavel: inscricao.criado_por,
  cliente: tenantId,
  canal: 'inscricao',
}

// 1. Envie o payload acima para `/api/pedidos` e obtenha `pedidoId`
// 2. Chame `/api/asaas` passando `pedidoId`, `valorBruto`, `paymentMethod` e `installments`
// 3. Se `checkout.url` existir, atualize o pedido com `link_pagamento` e prossiga
```

- Atualizar campo `aprovada` → `true`
- Atualizar campo `confirmado_por_lider` → `true`
- Atualizar inscrição com:

```json
{
  "pedido": "ID_DO_PEDIDO",
  "status": "aguardando_pagamento",
  "confirmado_por_lider": true,
  "aprovada": true
}
```

#### Resultado:

Inscrição segue normalmente para pagamento e posterior confirmação.

---

### ❌ 2. Recusar Inscrição

> Marca a inscrição como recusada. Não gera pedido nem cobrança.

#### Regras:

- Atualizar campo `aprovada` → `false`
- Atualizar campo `confirmado_por_lider` → `true`
- Atualizar campo `status` → `cancelado`

#### Resultado:

Inscrição é considerada **avaliada**, mas rejeitada. Não será faturada.

---

## 🛠️ Fluxo de Atualização

| Ação      | `aprovada` | `confirmado_por_lider` | `status`               | Pedido                            |
| --------- | ---------- | ---------------------- | ---------------------- | --------------------------------- |
| Confirmar | `true`     | `true`                 | `aguardando_pagamento` | Criado via API com `id_inscricao` |
| Recusar   | `false`    | `true`                 | `cancelado`            | —                                 |

---

## 🔐 Permissões

Apenas os seguintes perfis podem executar essas ações:

- `coordenador`
- `lider` (desde que vinculado ao campo da inscrição)

---

## 📎 Referências Técnicas

- Campo `aprovada`: booleano, define se a inscrição será processada financeiramente
- Campo `confirmado_por_lider`: booleano, marca que houve análise manual
- Campo `pedido`: referência à coleção `pedidos`
- Campo `id_inscricao` em `pedidos`: relação direta com `id` da inscrição
- Status possíveis: `pendente`, `aguardando_pagamento`, `confirmado`, `vencido`, `cancelado`

**Estrutura esperada da coleção `pedidos`:**

| Campo            | Tipo   | Obrigatório | Observações                                   |
| ---------------- | ------ | ----------- | --------------------------------------------- |
| `id`             | String | Sim         | Identificador único                           |
| `id_pagamento`   | String | Não         | ID retornado do Asaas                         |
| `id_inscricao`   | Rel.   | Sim         | Relacionado à inscrição                       |
| `produto`        | Rel.[] | Sim         | Produtos vinculados                           |
| `cores`          | Array  | Sim         | Cores escolhidas                              |
| `tamanho`        | Enum   | Sim         | `PP` • `P` • `M` • `G` • `GG`                 |
| `email`          | String | Sim         | E-mail do inscrito                            |
| `status`         | Enum   | Sim         | `pendente` • `pago` • `vencido` • `cancelado` |
| `campo`          | Rel.   | Sim         | Campo da inscrição                            |
| `responsavel`    | Rel.   | Sim         | Usuário que aprovou                           |
| `genero`         | Enum   | Sim         | `feminino` • `masculino`                      |
| `valor`          | Number | Sim         | Valor total do pedido                         |
| `link_pagamento` | String | Sim         | URL gerada pelo Asaas                         |
| `cliente`        | Rel.   | Sim         | Cliente (tenant) relacionado                  |
| `canal`          | Enum   | Sim         | `inscricao` • `loja`                          |
| `created`        | Date   | Auto        | Data de criação                               |
| `updated`        | Date   | Auto        | Última atualização                            |
