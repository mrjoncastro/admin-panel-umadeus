# Documento do Espaço do Cliente

## 1. Introdução

Este documento descreve a Área do Cliente do portal, onde cada tenant pode:

- Visualizar status de pedidos e inscrições.
- Gerenciar seu perfil e configurações.
- Conectar seu Instagram para exibir o feed.
- Navegar de forma segura e isolada entre tenants.

---

## 2. Objetivos Principais

1. **Visão Geral**: Painel resumido com indicadores (KPIs) e próximos eventos.
2. **Histórico**: Listar pedidos e inscrições do cliente.
3. **Interatividade**: Permitir ações como cancelar inscrição e rever detalhes de pedidos.
4. **Engajamento**: Incentivar conexão com Instagram e exibir posts no painel.
5. **Segurança**: Isolamento total por tenant.

---

## 3. Arquitetura Técnica

- **Next.js (App Router)**
  - **Server Components** para dados estáticos e SEO.
  - **Client Components** para formulários e interações.
- **PocketBase**
  - Coleções: `pedidos`, `inscricoes`,
  - Regras de API: record-level permissions por `tenantId`.
- **API Routes**
  - `/api/pedidos`
  - `/api/inscricoes`

---

## 4. Estrutura de Interface (Wireframe)

```
┌───────────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Pedidos  Inscrições    Perfil        │  < Header fixo >
└───────────────────────────────────────────────────────────────────┘
┌─────────┬─────────────────────────────────────────────────────────┐
│ Sidebar │                   Área Principal                      │
│         │                                                     │
│ • Dashboard      Olá, [Nome]! Bem-vindo ao seu espaço.       │
│ • Pedidos        ▶ Total de Pedidos: 12                      │
│ • Inscrições     ▶ Próximos Eventos: Congresso 2K25          │
│ • Perfil         [página de perfil e configurações]          │
│         │                                                     │
│         │ [Tabela: Histórico de Pedidos]                      │
│         │ [Tabela: Minhas Inscrições]                          │
│         │                                                     │
│         │ [Formulário: Configurações de Perfil]               │
└─────────┴─────────────────────────────────────────────────────────┘
```

- **Header**: Navegação principal.
- **Sidebar** (opcional): Atalhos rápidos.
- **Cartões de KPI**: Visão resumida.
- **Tabelas**: Históricos com paginação.
- **Card Instagram**: botão de conexão ou grid de posts.
- **Perfil**: Formulário de edição de dados.

---

## 5. Componentes Principais

| Componente        | Descrição                                                 |
| ----------------- | --------------------------------------------------------- |
| `DashboardHeader` | Exibe nome e KPIs básicos.                                |
| `PedidosTable`    | Lista pedidos com status, valores e ação de detalhes.     |
| `InscricoesTable` | Lista inscrições com evento, data e ação de cancelamento. |
| `ProfileForm`     | Formulário para atualizar dados e preferências.           |
| `Sidebar`         | Navegação lateral (se optar por layout com sidebar).      |

---

## 6. Rotas e Fluxos de Navegação

- **GET `/cliente/dashboard`**: Página principal.
- **GET `/cliente/pedidos`**: Listagem de pedidos.
- **GET `/cliente/inscricoes`**: Listagem de inscrições.
- **PATCH `/api/usuarios/[id]`**: Atualizar perfil.
- **DELETE `/api/inscricoes/[id]`**: Cancelar inscrição.

---

## 7. Segurança e Isolamento

- **Middleware Next.js**: injeta `tenantId` a partir de JWT/session.
- **PocketBase API Rules**:
  - `colecao = pedidos/inscricoes`: `cliente = @request.auth.cliente` para List/View.

---

## 8. Tecnologias

- Next.js 15 (App Router)
- React 18
- PocketBase v0.28.1
- Tailwind CSS
- Fetch API / SWR (opcional)

---

## 9. Próximos Passos

1. Implementar telas com os componentes descritos.
2. Configurar middleware de autenticação e tenant.
3. Criar e aplicar API Rules no PocketBase.
4. Testar fluxo completo em ambientes de dev e staging.
5. Ajustes de UI/UX e responsividade.

---

_Documento gerado para orientar desenvolvimento da Área do Cliente._
