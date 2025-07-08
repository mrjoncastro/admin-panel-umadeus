# Docker & Docker Compose

## Pré-requisitos

1. **Instale o Docker Desktop**:
   - Windows: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows/)
   - macOS: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac/)
   - Linux: [Docker Engine](https://docs.docker.com/engine/install/)

2. **Verifique a instalação**:
   ```bash
   docker --version
   docker compose version
   ```

## Comandos Docker Compose

### Subir todos os serviços
```bash
docker compose up --build
```

### Subir em background
```bash
docker compose up -d --build
```

### Verificar status dos serviços
```bash
docker compose ps
```

### Parar todos os serviços
```bash
docker compose down
```

### Ver logs de um serviço específico
```bash
docker compose logs gateway
docker compose logs pocketbase
docker compose logs redis
docker compose logs postgres
```

## Serviços Disponíveis

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| gateway | 3000 | Next.js (portal, admin, loja, blog) |
| pocketbase | 8090 | Banco de dados e autenticação |
| redis | 6379 | Cache e filas |
| postgres | 5432 | Banco de dados relacional |

## Testando os Endpoints

Após subir os serviços, teste:

```bash
# Gateway
curl http://localhost:3000/

# PocketBase Admin
curl http://localhost:8090/_/

# Redis (se tiver redis-cli)
redis-cli -h localhost -p 6379 ping

# Postgres (se tiver psql)
psql -h localhost -p 5432 -U postgres
```

## Troubleshooting

### Porta já em uso
Se alguma porta estiver ocupada, edite o `docker-compose.yml` e mude a porta externa:

```yaml
services:
  gateway:
    ports: ['3001:3000']  # Mude 3000 para 3001
```

### Erro de permissão
No Windows/macOS, certifique-se de que o Docker Desktop está rodando.

### Limpar containers antigos
```bash
docker compose down -v  # Remove volumes também
docker system prune -a  # Remove containers, imagens e volumes não utilizados
```

## Desenvolvimento

Para desenvolvimento local sem Docker:

```bash
# Instalar dependências
pnpm install

# Rodar apenas o gateway
pnpm dev

# Rodar testes
pnpm test
``` 