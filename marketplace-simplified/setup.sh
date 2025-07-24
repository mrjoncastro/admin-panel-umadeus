#!/bin/bash

echo "🚀 Setup do Marketplace Simplificado..."

# Instalar dependências
npm install

# Copiar arquivo de ambiente
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Configure suas variáveis de ambiente no arquivo .env"
fi

# Verificar se as variáveis estão configuradas
if grep -q "your-supabase-url" .env; then
    echo "⚠️  Configure as variáveis do Supabase no arquivo .env"
fi

echo "✅ Setup concluído!"
echo "📝 Próximos passos:"
echo "1. Configure as variáveis no arquivo .env"
echo "2. Execute: npm run dev"
echo "3. Acesse: http://localhost:3000"
