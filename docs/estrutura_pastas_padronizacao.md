# Guia de Padronização de Pastas

## 1. Visão Geral

```plaintext
/app
 ├── api
 │    ├── auth
 │    │    ├── login
 │    │    │    └── route.ts
 │    │    └── me
 │    │         └── route.ts
 │    ├── pedidos
 │    │    └── route.ts
 │    ├── inscricoes
 │    │    └── route.ts
 │    ├── usuarios
 │    │    └── route.ts
 │    ├── produtos
 │    │    └── route.ts
 │    └── eventos
 │         └── route.ts
 ├── admin            # Área de administração

 │         └── page.tsx
 ├── loja             # Vitrine pública
 │    └── ...
 ├── components       # Componentes UI puros (sem lógica de dados)
 ├── layouts          # Layouts compartilhados
 │    └── admin-layout.tsx
 └── page.tsx         # Landing page
/lib
 ├── pocketbase.ts    # Factory de PocketBase (server-only)
 ├── server/         # Utilidades de backend
 ├── flows/          # Fluxos de negocio
/hooks
 ├── useAuth.ts       # useMe, useLogin
 ├── usePedidos.ts    # fetch /api/pedidos
 ├── useInscricoes.ts
 ├── useUsuarios.ts
 └── useProdutos.ts
/public
 └── assets           # Imagens, ícones, fontes
/styles
 └── globals.css      # Tailwind, variáveis, resets
/next.config.js
/tsconfig.json
/scripts             # Scripts auxiliares
/stories             # Storybook de componentes
/__tests__           # Testes automatizados
/logs                # Historico de documentacao e erros

## 2. Convenções de Nomeação

- **APIs**

  - Pasta `/app/api/<recurso>/route.ts`
  - Função exportada: `export async function GET/POST/PUT/DELETE`

- **Páginas**

  - Client Pages: `/app/admin/.../page.tsx` ou `/app/loja/.../page.tsx`
  - Server Pages (sem hooks): apenas em `/app` ou rotas públicas.

- **Components**

  - Apenas JSX + props, sem fetch de dados.
  - Nome em PascalCase, ex.: `Button.tsx`, `PedidosTable.tsx`.

- **Hooks**

  - Prefixo `use`, CamelCase, ex.: `usePedidos.ts`, `useAuth.ts`.

- **Libs**
  - Helpers e factories devem ficar em `/lib`.
  - Ex.: `pocketbase.ts`, `getTenantFromHost.ts`.

## 3. Princípios

1. **Separação de responsabilidades**

   - **API Routes**: autenticação, autorização, filtragem `tenantId`, CRUD no PocketBase.
   - **Hooks**: invocam `/api/*` e tratam estados de loading/erro.
   - **Components**: recebem dados via props e renderizam UI.

2. **Sem CORS no cliente**

   - Todo fetch cruza apenas dentro de `localhost:3000` (mesmo domínio).

3. **Tenant-first**

   - Todas as chamadas de dados passam por `/api` que aplica `filter: cliente = "\${tenant}"`.

4. **Middleware**
   - usar `middleware.ts` para extrair cookies e injetar `tenantId`/authStore globalmente.

## 4. Fluxo de Dados

1. **Login** `/api/auth/login` → cookie HTTP-only
2. **Me** `/api/auth/me` → user
3. **Listagens** `/api/<recurso>` → array de objetos
4. **Mutations** `/api/<recurso>` (POST/PUT/DELETE) → success/falha

No React:

```tsx
const { data, error } = useFetch('/api/pedidos', { credentials: 'include' })
```

## 5. Boas Práticas de Organização

- **Agrupe telas e componentes por feature**  
  Ex.: tudo de “Pedidos” em `/app/admin/pedidos`, com seus próprios subcomponentes.

- **Mantenha `/components` somente para UI genéricos**  
  Botões, cabeçalhos, tabelas comuns.

- **Hooks e serviços** em `/hooks` e `/lib`  
  Não misture lógica de acesso a dados em componentes.
