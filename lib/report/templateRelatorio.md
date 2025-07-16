# Relatório de Regras

O sistema possui três formas principais de criação de pedidos e produtos. Este documento resume as orientações essenciais.

## Pedidos
- Coordenadores visualizam todos os pedidos, líderes apenas os do seu campo e usuários somente os próprios.
- Os pedidos surgem pelo checkout da loja ou pela aprovação de inscrições. Em ambos, começam como `pendente` e mudam para `pago` após confirmação do Asaas.
- Quando `confirma_inscricoes` está ativo, a inscrição precisa ser aprovada antes de gerar o pedido.
- Cada pedido pode conter vários produtos e registra valor, status, vencimento e `canal`.

## Produtos
- **Independente** – vendido diretamente na loja (canal `loja`).
- **Vinculado a evento sem aprovação** – cria pedido automático com canal `inscricao`.
- **Vinculado a evento com aprovação** – exige inscrição aprovada para liberar a compra.

## Campo `canal`
- Indica a origem do pedido (`loja`, `inscricao` ou `avulso`). Pedidos avulsos são criados manualmente por líderes.

Desenvolvido por M24 Tecnologia <m24saude.com.br>
