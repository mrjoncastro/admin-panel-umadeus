# Catalog Service

Serviço de catálogo para gerenciamento de produtos e categorias com suporte a multi-tenancy e Row Level Security (RLS).

## 🏗️ Arquitetura

- **Framework**: Express.js com TypeScript
- **Banco de Dados**: PostgreSQL com RLS
- **Validação**: Zod
- **Segurança**: Helmet, CORS, Rate Limiting
- **Versionamento**: API v1

## 🚀 Execução

### Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Executar migrações
pnpm migrate

# Iniciar em modo desenvolvimento
pnpm dev
```

### Docker

```bash
# Build e execução
docker compose up catalog

# Apenas build
docker build -t catalog-service .
```

## 📚 API Endpoints

### Produtos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/products` | Listar produtos (com paginação e filtros) |
| GET | `/api/v1/products/:id` | Buscar produto por ID |
| GET | `/api/v1/products/slug/:slug` | Buscar produto por slug |
| POST | `/api/v1/products` | Criar novo produto |
| PATCH | `/api/v1/products/:id` | Atualizar produto |
| DELETE | `/api/v1/products/:id` | Deletar produto |
| PATCH | `/api/v1/products/:id/stock` | Atualizar estoque |

### Categorias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/categories` | Listar categorias |
| GET | `/api/v1/categories/:id` | Buscar categoria por ID |
| GET | `/api/v1/categories/slug/:slug` | Buscar categoria por slug |
| POST | `/api/v1/categories` | Criar nova categoria |
| PATCH | `/api/v1/categories/:id` | Atualizar categoria |
| DELETE | `/api/v1/categories/:id` | Deletar categoria |

## 🔐 Multi-Tenancy

O serviço utiliza **Row Level Security (RLS)** do PostgreSQL para isolar dados por tenant:

- Cada requisição deve incluir o header `x-tenant-id`
- O RLS filtra automaticamente os dados por tenant
- Políticas de segurança garantem isolamento completo

### Exemplo de Requisição

```bash
curl -H "x-tenant-id: tenant-123" \
     -H "Content-Type: application/json" \
     http://localhost:5000/api/v1/products
```

## 🗄️ Estrutura do Banco

### Tabela `produtos`

```sql
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  slug VARCHAR(255) NOT NULL UNIQUE,
  cores TEXT[],
  generos TEXT[],
  cliente UUID NOT NULL,
  exclusivo_user BOOLEAN DEFAULT false,
  requer_inscricao_aprovada BOOLEAN DEFAULT false,
  evento_id UUID,
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela `categorias`

```sql
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  cliente UUID NOT NULL,
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Variáveis de Ambiente

```env
# Banco de Dados
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=catalog
POSTGRES_USER=postgres
POSTGRES_PASSWORD=example

# Servidor
CATALOG_PORT=5000
NODE_ENV=development

# Migrações
RUN_MIGRATIONS=true

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Executar testes em modo watch
pnpm test --watch

# Executar testes com cobertura
pnpm test --coverage
```

## 📊 Health Check

```bash
curl http://localhost:5000/health
```

Resposta:
```json
{
  "success": true,
  "service": "catalog",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Migrações

As migrações são executadas automaticamente na inicialização do serviço quando `RUN_MIGRATIONS=true`:

- Criação das tabelas
- Configuração do RLS
- Criação de índices
- Configuração de triggers

Para executar manualmente:

```bash
pnpm migrate
```

## 🚨 Logs e Monitoramento

O serviço utiliza Morgan para logging HTTP e console.error para erros:

```bash
# Ver logs do container
docker compose logs catalog

# Ver logs em tempo real
docker compose logs -f catalog
```

## 🔒 Segurança

- **Helmet**: Headers de segurança
- **CORS**: Controle de origens permitidas
- **Rate Limiting**: 100 requests por 15 minutos por IP
- **RLS**: Isolamento de dados por tenant
- **Validação**: Zod para validação de entrada
- **Sanitização**: Escape de SQL injection via parâmetros

## 📈 Performance

- **Índices**: Otimizados para consultas por tenant, slug e status
- **Paginação**: Suporte a paginação em listagens
- **Connection Pool**: Pool de conexões PostgreSQL configurado
- **Caching**: Preparado para integração com Redis (futuro) 