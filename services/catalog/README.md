# Catalog Service

Serviço de catálogo para o QG3 Admin Panel, responsável por gerenciar produtos e categorias com suporte a multi-tenancy.

## 🚀 Funcionalidades

- **Produtos**: CRUD completo com filtros avançados
- **Categorias**: Gerenciamento de categorias de produtos
- **Multi-tenancy**: Isolamento completo por tenant
- **Row Level Security (RLS)**: Segurança no nível do banco de dados
- **API Versionada**: Suporte a versionamento de API
- **Validação**: Validação robusta de dados
- **Testes**: Cobertura completa de testes unitários e de integração

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Docker (opcional)

## 🛠️ Instalação

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do serviço:

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

## 🏃‍♂️ Execução

### Desenvolvimento
```bash
# Executar em modo desenvolvimento
pnpm dev

# Executar com hot reload
pnpm dev:watch
```

### Produção
```bash
# Build do projeto
pnpm build

# Executar em produção
pnpm start
```

### Docker
```bash
# Build da imagem
docker build -t catalog-service .

# Executar container
docker run -p 3001:3001 catalog-service
```

## 🧪 Testes

### Executar todos os testes
```bash
pnpm test
```

### Executar testes em modo watch
```bash
pnpm test:watch
```

### Executar testes com cobertura
```bash
pnpm test:coverage
```

### Executar testes de integração
```bash
pnpm test:run
```

### Interface visual para testes
```bash
pnpm test:ui
```

## 📊 Cobertura de Testes

O projeto inclui uma suíte completa de testes:

- **Testes Unitários**: Repositórios, validações e utilitários
- **Testes de Integração**: Rotas da API e fluxos completos
- **Testes de Banco**: Conexão e operações com PostgreSQL
- **Mocks**: Dados de teste e simulações

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

## 📚 API Reference

### Base URL
```
http://localhost:3001/api/v1
```

### Headers Obrigatórios
```
x-tenant-id: <tenant-id>
```

### Produtos

#### Listar Produtos
```http
GET /products?page=1&perPage=20&ativo=true&categoria=cat-123&search=termo
```

#### Buscar Produto por ID
```http
GET /products/:id
```

#### Criar Produto
```http
POST /products
Content-Type: application/json

{
  "nome": "Produto Teste",
  "user_org": "user-123",
  "quantidade": 10,
  "preco": 29.90,
  "preco_bruto": 32.90,
  "slug": "produto-teste",
  "descricao": "Descrição do produto"
}
```

#### Atualizar Produto
```http
PATCH /products/:id
Content-Type: application/json

{
  "nome": "Produto Atualizado",
  "preco": 39.90
}
```

#### Deletar Produto
```http
DELETE /products/:id
```

#### Atualizar Estoque
```http
PATCH /products/:id/stock
Content-Type: application/json

{
  "quantity": 2
}
```

### Categorias

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
Content-Type: application/json

{
  "nome": "Nova Categoria",
  "slug": "nova-categoria"
}
```

#### Atualizar Categoria
```http
PATCH /categories/:id
Content-Type: application/json

{
  "nome": "Categoria Atualizada"
}
```

#### Deletar Categoria
```http
DELETE /categories/:id
```

## 🏗️ Arquitetura

### Estrutura do Projeto
```
src/
├── database/
│   ├── connection.ts          # Conexão com PostgreSQL
│   └── migrations/
│       └── index.ts           # Migrações do banco
├── repositories/
│   ├── ProductRepository.ts   # Repositório de produtos
│   └── CategoryRepository.ts  # Repositório de categorias
├── routes/
│   └── v1/
│       ├── products.ts        # Rotas de produtos
│       └── categories.ts      # Rotas de categorias
├── types/
│   └── index.ts               # Tipos TypeScript
├── utils/
│   ├── validation.ts          # Validações
│   └── pagination.ts          # Utilitários de paginação
└── index.ts                   # Servidor Express
```

### Padrões Utilizados

- **Repository Pattern**: Isolamento da lógica de acesso a dados
- **Service Layer**: Separação de responsabilidades
- **Middleware Pattern**: Interceptação de requisições
- **Error Handling**: Tratamento centralizado de erros
- **Validation**: Validação de entrada de dados
- **Logging**: Sistema de logs estruturado

## 🔒 Segurança

### Row Level Security (RLS)
- Isolamento automático por tenant
- Políticas de segurança no PostgreSQL
- Prevenção de vazamento de dados entre tenants

### Middlewares de Segurança
- **Helmet**: Headers de segurança
- **CORS**: Controle de origem
- **Rate Limiting**: Proteção contra abuso
- **Input Validation**: Validação de entrada

## 📈 Monitoramento

### Health Check
```http
GET /health
```

### Logs
- Logs estruturados em JSON
- Níveis: error, warn, info, debug
- Contexto de tenant em todas as operações

## 🚀 Deploy

### Docker Compose
O serviço está integrado ao `docker-compose.yml` principal:

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

### CI/CD
- Testes automáticos no GitHub Actions
- Build e deploy automatizado
- Verificação de qualidade de código

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- ESLint para linting
- Prettier para formatação
- Conventional Commits
- Testes obrigatórios para novas features

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte, entre em contato com a equipe QG3 ou abra uma issue no repositório. 