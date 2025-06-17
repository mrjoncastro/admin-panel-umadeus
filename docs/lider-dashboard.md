# Lider Dashboard

Esta página descreve o painel restrito aos líderes.

## Autenticação

O acesso é protegido pelo hook `useAuthGuard(['lider'])`, garantindo que apenas líderes autenticados possam visualizar o conteúdo.

## Funcionalidades

- Visualização de inscrições e pedidos do campo associado
- Gráficos com métricas básicas de inscrições e vendas
- Exportação de relatórios em CSV ou XLSX

## Rota

Acesse `/admin/lider-painel` para abrir o painel de líder.
