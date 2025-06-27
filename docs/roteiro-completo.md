# Roteiro Completo de Páginas e Tour

Este documento relaciona cada página do frontend com as orientações do Joyride.
As descrições servem como base para expandir o tour de forma consistente.

## Páginas Públicas

- `/` – Página inicial
- `/login` – Formulário de acesso
- `/signup` – Cadastro de novo usuário
- `/loja` – Vitrine principal de produtos
- `/loja/carrinho` – Itens adicionados à compra
- `/loja/checkout` – Finalização de pedidos
- `/loja/eventos` – Lista de eventos abertos
- `/loja/produtos` – Catálogo de produtos
- `/blog` – Listagem de artigos
- Outras rotas de inscrição em `/inscricoes/*`

*Nenhuma dessas rotas possui passos definidos no Joyride até o momento.*

## Área do Cliente

- `/cliente/dashboard`
- `/cliente/inscricoes`
- `/cliente/pedidos`
- `/cliente/perfil`

*Ainda não há passos configurados para estas telas.*

## Painel Admin

Abaixo estão as páginas administrativas com seus respectivos passos
implementados em `components/tourSteps.ts`.

| Rota | Etapas do Joyride |
| --- | --- |
| `/admin/dashboard` | `'.stats-card'` – principais métricas. `'.nav-inscricoes'` – link para inscrições |
| `/admin/inscricoes` | `'.filtro-inscricoes'` – filtrar participantes. `'.tabela-inscricoes'` – lista de registros |
| `/admin/pedidos` | `'.filtro-pedidos'` – filtrar pedidos. `'.tabela-pedidos'` – pagamentos gerados |
| `/admin/produtos` | `'.btn-novo-produto'` – criar produto. `'.tabela-produtos'` – itens à venda |
| `/admin/clientes` | `'.tabela-clientes'` – histórico de cada cliente |
| `/admin/campos` | `'.lista-campos'` – campos cadastrados. `'.btn-novo-campo'` – adicionar campo |
| `/admin/configuracoes` | `'.form-config'` – personalizar sistema. `'.toggle-confirmar-inscricoes'` – confirmação manual |
| `/admin/eventos` | `'.btn-novo-evento'` – criar evento. `'.tabela-eventos'` – lista de eventos |
| `/admin/financeiro` | `'.saldo-atual'` – saldo disponível. `'.btn-transferir-saldo'` – transferir valor |
| `/admin/usuarios` | `'.btn-novo-usuario'` – adicionar colaborador. `'.tabela-usuarios'` – níveis de acesso |
| `/admin/posts` | `'.btn-novo-post'` – publicar notícia. `'.tabela-posts'` – artigos publicados |
| `/admin/perfil` | `'.perfil-dados'` – dados pessoais. `'.btn-editar-perfil'` – editar informações |
| `/admin/whatsapp` | `'.onboarding-wizard'` – configurar integração |

As rotas acima contam com dicas que surgem na primeira visita e podem ser reativadas
pelo botão flutuante "Ajuda" (ícone de interrogação).
