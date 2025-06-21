# Fluxos de Venda

Este fluxograma ilustra o comportamento ao adicionar um produto no carrinho.

1. O produto possui evento vinculado?
   - **Não**: cria um pedido com `canal` = `loja`.
   - **Sim**: verificar se o evento exige aprovação.
     - **Não exige**: cria o pedido normalmente (`canal` = `inscricao`).
     - **Exige aprovação**: exibe o aviso "Requer inscrição aprovada" e o botão de compra fica desativado até a liberação.
