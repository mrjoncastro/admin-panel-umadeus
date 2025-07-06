# Regras de Visualização e Pedidos

Este documento explica quem pode criar e consultar pedidos e como eles são gerados em diferentes cenários.

## Escopo de Visualização

- **Coordenador** – visualiza todos os pedidos de todos os campos.
- **Líder** – visualiza apenas os pedidos do seu campo.
- **Usuário** – visualiza somente seus próprios pedidos na página `/cliente/dashboard`.

## Criação de Pedidos

Pedidos podem surgir de duas maneiras:

1. **Checkout da Loja** – o usuário adiciona produtos ao carrinho e conclui em `/loja/checkout`. O backend chama o Asaas e somente persiste o pedido se o link de pagamento for gerado com sucesso.
2. **Confirmação de Inscrição** – ao enviar o formulário de inscrição, se `confirma_inscricoes` estiver desativado, o pedido e a cobrança são criados automaticamente. Se a opção estiver ativada, o pedido só é gerado quando um líder ou coordenador aprova a inscrição.

Em ambos os casos o pedido recebe status `pendente` inicialmente e passa a `pago` quando o Asaas confirma o pagamento.

## Relação com `confirma_inscricoes`

- **Ativado** – as inscrições aguardam aprovação manual e o pedido é criado somente após essa etapa.
- **Desativado** – o pedido é criado imediatamente junto à inscrição, agilizando o fluxo.

Consulte também [docs/regras-inscricoes.md](docs/regras-inscricoes.md) para detalhes sobre o escopo das inscrições.

### Estrutura da coleção `pedidos`

O campo `produto` agora aceita **múltiplos** produtos vinculados ao mesmo pedido. O payload de criação deve enviar `produto: [idProduto]` e a tabela de campos fica:

| Campo     | Tipo   | Observações                       |
| --------- | ------ | --------------------------------- |
| `id`      | String | Identificador do pedido           |
| `produto` | Rel.[] | IDs dos produtos selecionados     |
| `valor`   | Number | Valor total do pedido             |
| `status`  | Enum   | `pendente`, `pago`, `vencido` ou `cancelado` |
| `canal`   | Enum   | `inscricao` ou `loja`             |
| `vencimento` | DateTime | Data limite para pagamento |

### Renovação manual de cobrança

Se o pedido permanecer com status `pendente` e o campo `vencimento` estiver expirado,
um administrador pode gerar uma nova cobrança pelo botão **Gerar nova cobrança**
nos detalhes do pedido. O sistema envia a requisição para `/api/pedidos/[id]/nova-cobranca`,
atualizando o `link_pagamento` e o `vencimento` com mais três dias.

## Edição de Pedido

O líder pode ajustar campos como email ou tamanho do produto, mas **não** tem
permissão para alterar o `status` do pedido durante a edição. Essa ação fica
restrita aos coordenadores.
