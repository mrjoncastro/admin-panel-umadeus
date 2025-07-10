# Catalog Service - Documentação Técnica

## 📋 Visão Geral

O **Catalog Service** é um microserviço responsável por gerenciar produtos e categorias no sistema QG3 Admin Panel. Implementado com Express.js, TypeScript e PostgreSQL, oferece uma API RESTful com suporte completo a multi-tenancy e Row Level Security (RLS).

## 🏗️ Arquitetura

### Stack Tecnológica
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Linguagem**: TypeScript 5.3+
- **Banco de Dados**: PostgreSQL 14+
- **Testes**: Vitest + Supertest
- **Containerização**: Docker

### Padrões Arquiteturais
- **Repository Pattern**: Isolamento da lógica de acesso a dados
- **Service Layer**: Separação de responsabilidades
- **Middleware Pattern**: Interceptação de requisições
- **Error Handling**: Tratamento centralizado de erros
- **Validation**: Validação de entrada de dados
- **Logging**: Sistema de logs estruturado

## 🗄️ Modelo de Dados

### Tabela `produtos`
```sql
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  user_org VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  preco DECIMAL(10,2) NOT NULL,
  preco_bruto DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  tamanhos TEXT[],
  imagens TEXT[],
  descricao TEXT,
  detalhes TEXT,
  categoria UUID REFERENCES categorias(id),
  slug VARCHAR(255) UNIQUE NOT NULL,
  cores TEXT[],
  generos TEXT[],
  cliente VARCHAR(255) NOT NULL,
  exclusivo_user BOOLEAN DEFAULT false,
  requer_inscricao_aprovada BOOLEAN DEFAULT false,
  evento_id UUID,
  created TIMESTAMP DEFAULT NOW(),
  updated TIMESTAMP DEFAULT NOW()
);
```

### Tabela `categorias`
```sql
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  created TIMESTAMP DEFAULT NOW(),
  updated TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Segurança

### Row Level Security (RLS)
O serviço implementa RLS no PostgreSQL para garantir isolamento completo entre tenants:

```sql
-- Política para produtos
CREATE POLICY produtos_tenant_isolation ON produtos
  FOR ALL USING (cliente = current_setting('app.tenant_id'));

-- Política para categorias  
CREATE POLICY categorias_tenant_isolation ON categorias
  FOR ALL USING (cliente = current_setting('app.tenant_id'));
```

### Middlewares de Segurança
- **Helmet**: Headers de segurança HTTP
- **CORS**: Controle de origem de requisições
- **Rate Limiting**: Proteção contra abuso da API
- **Input Validation**: Validação robusta de entrada

## 📡 API Reference

### Base URL
```
http://localhost:3001/api/v1
```

### Headers Obrigatórios
```
x-tenant-id: <tenant-id>
Content-Type: application/json
```

### Endpoints de Produtos

#### Listar Produtos
```http
GET /products?page=1&perPage=20&ativo=true&categoria=cat-123&search=termo
```

**Parâmetros de Query:**
- `page` (number): Página atual (padrão: 1)
- `perPage` (number): Itens por página (padrão: 20, máx: 100)
- `ativo` (boolean): Filtrar por status ativo
- `categoria` (string): Filtrar por categoria
- `search` (string): Busca por nome ou descrição

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nome": "Produto Teste",
      "quantidade": 10,
      "preco": 29.90,
      "ativo": true,
      "slug": "produto-teste"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "totalItems": 50,
    "totalPages": 3
  }
}
```

#### Buscar Produto por ID
```http
GET /products/:id
```

#### Criar Produto
```http
POST /products
```

**Body:**
```json
{
  "nome": "Novo Produto",
  "user_org": "user-123",
  "quantidade": 10,
  "preco": 29.90,
  "preco_bruto": 32.90,
  "slug": "novo-produto",
  "descricao": "Descrição do produto",
  "categoria": "cat-uuid",
  "tamanhos": ["P", "M", "G"],
  "cores": ["#000000", "#FFFFFF"]
}
```

#### Atualizar Produto
```http
PATCH /products/:id
```

#### Deletar Produto
```http
DELETE /products/:id
```

#### Atualizar Estoque
```http
PATCH /products/:id/stock
```

**Body:**
```json
{
  "quantity": 2
}
```

### Endpoints de Categorias

#### Listar Categorias
```http
GET /categories
```

#### Buscar Categoria por ID
```http
GET /categories/:id
```

#### Criar Categoria
```http
POST /categories
```

**Body:**
```json
{
  "nome": "Nova Categoria",
  "slug": "nova-categoria"
}
```

#### Atualizar Categoria
```http
PATCH /categories/:id
```

#### Deletar Categoria
```http
DELETE /categories/:id
```

**Nota:** Categorias com produtos associados não podem ser deletadas.

## 🧪 Testes

### Estrutura de Testes
```
src/
├── __tests__/
│   ├── integration.test.ts    # Testes end-to-end
│   └── database.test.ts       # Testes de banco
├── repositories/__tests__/
│   ├── ProductRepository.test.ts
│   └── CategoryRepository.test.ts
├── routes/__tests__/
│   ├── products.test.ts
│   └── categories.test.ts
└── test/
    ├── setup.ts               # Configuração de testes
    ├── mocks/
    │   └── database.ts        # Mocks do banco
    └── helpers/
        └── validation.ts      # Helpers de validação
```

### Executar Testes
```bash
# Todos os testes
pnpm test

# Modo watch
pnpm test:watch

# Cobertura
pnpm test:coverage

# Interface visual
pnpm test:ui
```

## 🚀 Deploy

### Docker
```bash
# Build
docker build -t catalog-service .

# Executar
docker run -p 3001:3001 \
  -e POSTGRES_HOST=postgres \
  -e POSTGRES_DB=catalog \
  catalog-service
```

### Docker Compose
```yaml
catalog:
  build: ./services/catalog
  ports:
    - "3001:3001"
  environment:
    - POSTGRES_HOST=postgres
    - POSTGRES_DB=catalog
  depends_on:
    - postgres
```

## 📊 Monitoramento

### Health Check
```http
GET /health
```

**Resposta:**
```json
{
  "success": true,
  "service": "catalog",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Logs
O serviço utiliza logs estruturados em JSON com os seguintes níveis:
- `error`: Erros críticos
- `warn`: Avisos importantes
- `info`: Informações gerais
- `debug`: Informações detalhadas

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Servidor
PORT=3001
NODE_ENV=development

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=catalog
POSTGRES_USER=postgres
POSTGRES_PASSWORD=example

# Logs
LOG_LEVEL=info
```

## 📈 Métricas

### Endpoints de Métricas
- **Produtos por Tenant**: Contagem de produtos por cliente
- **Categorias por Tenant**: Contagem de categorias por cliente
- **Performance**: Tempo de resposta das queries
- **Erros**: Taxa de erro por endpoint

## 🔄 Integração com Gateway

O Gateway faz proxy das requisições de produtos para o Catalog Service:

```typescript
// services/gateway/app/api/v1/products/route.ts
const catalogResponse = await fetch(`${CATALOG_URL}/api/v1/products`, {
  method: req.method,
  headers: {
    'x-tenant-id': tenantId,
    'Content-Type': 'application/json'
  },
  body: req.method !== 'GET' ? JSON.stringify(body) : undefined
});
```

## 🛠️ Desenvolvimento

### Scripts Disponíveis
```bash
# Desenvolvimento
pnpm dev

# Build
pnpm build

# Testes
pnpm test

# Lint
pnpm lint

# Type check
pnpm type-check
```

### Estrutura do Projeto
```
services/catalog/
├── src/
│   ├── database/
│   │   ├── connection.ts
│   │   └── migrations/
│   ├── repositories/
│   │   ├── ProductRepository.ts
│   │   └── CategoryRepository.ts
│   ├── routes/
│   │   └── v1/
│   │       ├── products.ts
│   │       └── categories.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   └── pagination.ts
│   └── index.ts
├── tests/
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 📚 Referências

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Contribuição

Para contribuir com o Catalog Service:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças com testes
4. Execute `pnpm test` e `pnpm lint`
5. Abra um Pull Request

### Padrões de Código
- ESLint para linting
- Prettier para formatação
- Conventional Commits
- Testes obrigatórios para novas features 