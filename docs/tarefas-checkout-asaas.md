# Tarefas - Checkout com Asaas

Este documento lista as atividades necessárias para implementar o processo de checkout na página `loja/checkout` usando o **Checkout Pronto** do Asaas.

1. **Verificar autenticação do usuário**

   - Utilizar `useAuthContext` para checar se `isLoggedIn` é `true`.
   - Se o usuário não estiver autenticado, exibir mensagem orientando a criar uma conta ou fazer login.
   - Bloquear o envio do pedido enquanto não estiver autenticado.

2. **Criar sessão de Checkout Pronto**

   - Para usuários autenticados, chamar o endpoint `/api/asaas` passando `pedidoId`, `valorBruto`, `paymentMethod` e `installments` para gerar o checkout.
   - Registrar a `checkoutUrl` retornada no pedido e redirecionar o usuário para essa página.

3. **Tratar erros de integração**

   - Exibir feedback visual em caso de falha na criação do checkout.
   - Registrar detalhes do erro no console para futura análise.

4. **Atualizar testes e documentação**
   - Criar testes garantindo que visitantes vejam o aviso de conta necessária.
   - Documentar o fluxo de Checkout Pronto no README e no Storybook se aplicável.
