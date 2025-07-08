#!/bin/bash

echo "🚀 Setup de Desenvolvimento - QG3 Monorepo"
echo "=========================================="

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instale o Docker Desktop primeiro."
    exit 1
fi

# Verificar se o Docker Compose está disponível
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não está disponível. Use 'docker compose' (sem hífen)."
    exit 1
fi

echo "✅ Docker encontrado: $(docker --version)"
echo "✅ Docker Compose encontrado: $(docker compose version)"

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install

# Subir serviços
echo "🐳 Subindo serviços com Docker Compose..."
docker compose up -d --build

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status
echo "📊 Status dos serviços:"
docker compose ps

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "📱 Serviços disponíveis:"
echo "   - Gateway: http://localhost:3000"
echo "   - PocketBase: http://localhost:8090"
echo "   - Redis: localhost:6379"
echo "   - Postgres: localhost:5432"
echo ""
echo "🔧 Comandos úteis:"
echo "   - Ver logs: docker compose logs gateway"
echo "   - Parar: docker compose down"
echo "   - Status: docker compose ps" 