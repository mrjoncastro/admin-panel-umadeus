# 🔁 Fluxos de Venda

Este fluxograma ilustra o comportamento ao adicionar um produto ao carrinho ou tentar comprá-lo via vitrine:

1. **O produto possui vínculo com evento (`evento_id`)?**
   - ❌ **Não**:  
     → Criar pedido com `canal = 'loja'`.  
     → Redirecionar para checkout direto.

   - ✅ **Sim**:  
     2. **O evento exige aprovação de inscrição (`confirmaInscricoes = true`)?**
     - ❌ **Não exige**:  
       → Criar pedido automaticamente com `canal = 'inscricao'`.  
       → Redirecionar para link de pagamento.

     - ✅ **Exige aprovação**:  
       3. **O produto exige inscrição aprovada (`requer_inscricao_aprovada = true`)?**
       - ✅ **Sim**:
         - Verificar se usuário está autenticado.
         - Verificar se há inscrição aprovada para o evento.
         - ❌ **Não está aprovado**:
           → Exibir selo “Requer inscrição aprovada”.  
           → Desativar botão de compra ou mostrar `Aguardando liberação`.
         - ✅ **Está aprovado**:
           → Criar pedido normalmente com `canal = 'inscricao'`.
       - ❌ **Não exige**:
         → Criar pedido mesmo sem inscrição aprovada (fluxo automático).
