# Guia do Middleware Multi-Tenant

## Visão Geral

O middleware foi atualizado para identificar automaticamente o tenant (cliente) baseado no domínio da requisição, usando um **único banco de dados** para todos os tenants com filtros automáticos de isolamento de dados.

## Como Funciona

### 1. Identificação do Tenant

O middleware intercepta cada requisição e:

1. **Extrai o domínio** da requisição (ex: `app.cliente1.com`)
2. **Consulta a coleção `clientes_config`** para encontrar o tenant associado ao domínio
3. **Injeta o header `x-tenant-id`** na requisição
4. **Define cookie `tenantId`** para o frontend
5. **Cacheia a configuração** por 5 minutos para otimizar performance

### 2. Estrutura de Cache

```typescript
// Cache simples: domínio -> tenantId
const tenantConfigCache = new Map<string, string>()
```

### 3. Headers e Cookies Injetados

- **Header**: `x-tenant-id` - Usado pelas APIs server-side
- **Cookie**: `tenantId` - Acessível no frontend

## Funções Utilitárias

### `getCurrentTenantId()`

Obtém o tenant ID atual do contexto da requisição:

```typescript
import { getCurrentTenantId } from '@/lib/pocketbase'

const tenantId = getCurrentTenantId()
// Retorna: "tenant_abc123" ou null
```

### `addTenantFilter(filter, tenantId?)`

Adiciona filtro de tenant automaticamente:

```typescript
import { addTenantFilter } from '@/lib/pocketbase'

const filter = addTenantFilter("ativo=true")
// Retorna: "cliente='tenant_abc123' && (ativo=true)"
```

### `createTenantPocketBase(copyAuth?, tenantId?)`

Cria instância PocketBase com filtros automáticos de tenant:

```typescript
import { createTenantPocketBase } from '@/lib/pocketbase'

const pb = createTenantPocketBase()

// Estas consultas são automaticamente filtradas pelo tenant
const produtos = await pb.collection('produtos').getList()
const posts = await pb.collection('posts').getFullList()
```

## Exemplos de Uso

### 1. API Route com Filtro Automático

```typescript
// app/api/produtos/route.ts
import { createTenantPocketBase, getCurrentTenantId } from '@/lib/pocketbase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const tenantId = getCurrentTenantId()
  
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant não identificado' }, { status: 400 })
  }

  const pb = createTenantPocketBase()
  
  // Esta consulta retorna apenas produtos do tenant atual
  const produtos = await pb.collection('produtos').getList(1, 20, {
    filter: 'ativo=true' // O filtro de tenant é adicionado automaticamente
  })

  return NextResponse.json(produtos)
}
```

### 2. Criação com Tenant

```typescript
export async function POST(request: NextRequest) {
  const tenantId = getCurrentTenantId()
  const data = await request.json()

  const pb = createTenantPocketBase()
  
  // Ao criar, sempre inclua o campo cliente
  const produto = await pb.collection('produtos').create({
    ...data,
    cliente: tenantId // Importante: sempre associar ao tenant
  })

  return NextResponse.json(produto)
}
```

### 3. Componente React

```tsx
// components/ProdutosList.tsx
'use client'
import { useEffect, useState } from 'react'

export default function ProdutosList() {
  const [produtos, setProdutos] = useState([])

  useEffect(() => {
    // A API já filtra automaticamente pelo tenant do domínio
    fetch('/api/produtos')
      .then(res => res.json())
      .then(setProdutos)
  }, [])

  return (
    <div>
      {produtos.map(produto => (
        <div key={produto.id}>{produto.nome}</div>
      ))}
    </div>
  )
}
```

## Coleções com Filtro Automático

As seguintes coleções têm filtro automático de tenant:

- `produtos`
- `posts` 
- `pedidos`
- `inscricoes`
- `eventos`
- `clientes_pix`
- `clientes_contas_bancarias`
- `clientes_config`
- `categorias`
- `campos`
- `usuarios`
- `manifesto_clientes`

## Configuração de Domínios

### 1. Estrutura na Coleção `clientes_config`

```json
{
  "id": "config_123",
  "dominio": "app.cliente1.com",
  "cliente": "tenant_abc123",
  "cor_primary": "#0055AA",
  "nome": "Cliente 1"
}
```

### 2. Exemplos de Domínios Suportados

- **Subdomínio**: `cliente1.minhaapp.com`
- **Domínio próprio**: `app.cliente1.com`
- **Localhost**: `localhost:3000` (para desenvolvimento)

## Cache e Performance

### Cache de Configuração

- **Duração**: 5 minutos
- **Chave**: domínio da requisição
- **Valor**: tenant ID
- **Limpeza**: automática após timeout

### Otimizações

1. **Cache em memória** evita consultas repetidas ao banco
2. **Filtros automáticos** reduzem código boilerplate
3. **Reutilização de conexões** PocketBase

## Tratamento de Erros

### Domínio Não Encontrado

Quando um domínio não está configurado:

```typescript
// Middleware continua sem configuração de tenant
// APIs devem verificar presença do tenantId
const tenantId = getCurrentTenantId()
if (!tenantId) {
  return NextResponse.json({ error: 'Tenant não configurado' }, { status: 400 })
}
```

### Erro na Consulta

```typescript
// Middleware captura erros e continua
try {
  // ... consulta configuração
} catch (error) {
  console.error('Erro no middleware de tenant:', error)
  // Continua sem configuração de tenant
}
```

## Segurança

### Isolamento de Dados

- Cada tenant só acessa seus próprios dados
- Filtros automáticos impedem vazamento entre tenants
- Headers server-side não são expostos ao cliente

### Validações

- Sempre validar presença do `tenantId`
- Confirmar associação `cliente` ao criar registros
- Usar `createTenantPocketBase` para consultas automáticas

## Migração e Desenvolvimento

### Para Desenvolvedores

1. **Use `createTenantPocketBase()`** para consultas automáticas
2. **Sempre inclua `cliente: tenantId`** ao criar registros
3. **Valide `getCurrentTenantId()`** nas APIs
4. **Configure domínios** na coleção `clientes_config`

### Testes

```typescript
// __tests__/middleware.test.ts
import { middleware } from '../middleware'

test('identifica tenant pelo domínio', async () => {
  const request = new Request('http://cliente1.test.com/api/produtos')
  const response = await middleware(request)
  
  expect(response.headers.get('x-tenant-id')).toBe('tenant_abc123')
})
```

## Resumo

O middleware multi-tenant oferece:

✅ **Identificação automática** de tenant por domínio  
✅ **Filtros automáticos** para isolamento de dados  
✅ **Cache inteligente** para performance  
✅ **API simples** para desenvolvedores  
✅ **Segurança** por design  
✅ **Banco único** com isolamento lógico  

Com essa implementação, cada tenant opera de forma isolada usando o mesmo banco de dados, mantendo simplicidade e eficiência.