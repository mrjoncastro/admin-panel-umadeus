#!/bin/bash

# 🚀 Script de Migração: Docker → Stack Simplificada
# Este script automatiza a migração do projeto monorepo para uma stack simplificada

set -e  # Para em caso de erro

echo "🚀 Iniciando migração para stack simplificada..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Fase 1: Backup e Preparação
log "📦 Fase 1: Criando backup e preparando ambiente..."

# Criar diretório de backup
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup do projeto atual
log "Criando backup do projeto atual..."
cp -r services "$BACKUP_DIR/"
cp -r libs "$BACKUP_DIR/"
cp package.json "$BACKUP_DIR/"
cp docker-compose.yml "$BACKUP_DIR/"
cp .env* "$BACKUP_DIR/" 2>/dev/null || true

log "Backup criado em: $BACKUP_DIR"

# Fase 2: Criar nova estrutura
log "🏗️ Fase 2: Criando nova estrutura simplificada..."

# Criar diretório do novo projeto
NEW_PROJECT_DIR="marketplace-simplified"
mkdir -p "$NEW_PROJECT_DIR"

# Estrutura de diretórios
mkdir -p "$NEW_PROJECT_DIR/app"
mkdir -p "$NEW_PROJECT_DIR/components"
mkdir -p "$NEW_PROJECT_DIR/lib"
mkdir -p "$NEW_PROJECT_DIR/types"
mkdir -p "$NEW_PROJECT_DIR/public"

# Fase 3: Migrar Gateway (Next.js)
log "📦 Fase 3: Migrando Gateway (Next.js)..."

if [ -d "services/gateway" ]; then
    # Copiar app directory
    if [ -d "services/gateway/app" ]; then
        cp -r services/gateway/app/* "$NEW_PROJECT_DIR/app/"
        log "✓ App directory migrado"
    fi
    
    # Copiar components
    if [ -d "services/gateway/components" ]; then
        cp -r services/gateway/components/* "$NEW_PROJECT_DIR/components/"
        log "✓ Components migrados"
    fi
    
    # Copiar lib
    if [ -d "services/gateway/lib" ]; then
        cp -r services/gateway/lib/* "$NEW_PROJECT_DIR/lib/"
        log "✓ Lib migrado"
    fi
    
    # Copiar public
    if [ -d "services/gateway/public" ]; then
        cp -r services/gateway/public/* "$NEW_PROJECT_DIR/public/"
        log "✓ Public assets migrados"
    fi
    
    # Copiar configurações
    if [ -f "services/gateway/next.config.ts" ]; then
        cp services/gateway/next.config.ts "$NEW_PROJECT_DIR/"
    fi
    
    if [ -f "services/gateway/tailwind.config.js" ]; then
        cp services/gateway/tailwind.config.js "$NEW_PROJECT_DIR/"
    fi
    
    if [ -f "services/gateway/postcss.config.js" ]; then
        cp services/gateway/postcss.config.js "$NEW_PROJECT_DIR/"
    fi
fi

# Fase 4: Migrar Bibliotecas Compartilhadas
log "📚 Fase 4: Migrando bibliotecas compartilhadas..."

if [ -d "libs/types" ]; then
    cp -r libs/types/* "$NEW_PROJECT_DIR/types/"
    log "✓ Types migrados"
fi

if [ -d "libs/utils" ]; then
    mkdir -p "$NEW_PROJECT_DIR/lib/utils"
    cp -r libs/utils/* "$NEW_PROJECT_DIR/lib/utils/"
    log "✓ Utils migrados"
fi

if [ -d "libs/design-tokens" ]; then
    mkdir -p "$NEW_PROJECT_DIR/lib/design-tokens"
    cp -r libs/design-tokens/* "$NEW_PROJECT_DIR/lib/design-tokens/"
    log "✓ Design tokens migrados"
fi

# Fase 5: Criar package.json simplificado
log "📦 Fase 5: Criando package.json simplificado..."

cat > "$NEW_PROJECT_DIR/package.json" << 'EOF'
{
  "name": "marketplace-simplified",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@supabase/supabase-js": "^2.50.5",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@stripe/stripe-js": "^2.4.0",
    "stripe": "^14.10.0",
    "framer-motion": "^12.17.3",
    "lucide-react": "^0.511.0",
    "next": "latest",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zod": "^3.25.61",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.21",
    "eslint": "^8.57.0",
    "eslint-config-next": "latest",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.8.3",
    "vitest": "^1.5.0"
  }
}
EOF

log "✓ Package.json criado"

# Fase 6: Criar configurações TypeScript
log "⚙️ Fase 6: Criando configurações TypeScript..."

cat > "$NEW_PROJECT_DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

log "✓ TypeScript configurado"

# Fase 7: Criar arquivo de configuração do Supabase
log "🔧 Fase 7: Criando configuração do Supabase..."

cat > "$NEW_PROJECT_DIR/lib/supabase.ts" << 'EOF'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para operações server-side
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
EOF

log "✓ Configuração do Supabase criada"

# Fase 8: Criar arquivo .env.example
log "🔐 Fase 8: Criando arquivo .env.example..."

cat > "$NEW_PROJECT_DIR/.env.example" << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOF

log "✓ Arquivo .env.example criado"

# Fase 9: Criar README
log "📖 Fase 9: Criando README..."

cat > "$NEW_PROJECT_DIR/README.md" << 'EOF'
# 🚀 Marketplace Simplificado

Versão simplificada do marketplace sem Docker, usando Next.js + Supabase Cloud.

## 🚀 Como Rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar .env com suas credenciais
```

### 3. Rodar em desenvolvimento
```bash
npm run dev
```

### 4. Acessar
- http://localhost:3000

## 📦 Stack Utilizada

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase Cloud
- **Banco**: PostgreSQL (via Supabase)
- **Autenticação**: Supabase Auth
- **Pagamentos**: Stripe
- **Deploy**: Vercel

## 🔧 Scripts Disponíveis

- `npm run dev` - Desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Rodar em produção
- `npm run lint` - Linting
- `npm run test` - Testes
- `npm run type-check` - Verificação de tipos

## 📁 Estrutura

```
├── app/              # Next.js App Router
├── components/       # Componentes React
├── lib/             # Utilitários e configurações
├── types/           # Tipagens TypeScript
└── public/          # Assets estáticos
```

## 🎯 Funcionalidades

- ✅ Autenticação de usuários
- ✅ Catálogo de produtos
- ✅ Carrinho de compras
- ✅ Checkout com Stripe
- ✅ Painel administrativo
- ✅ Sistema de comissões
- ✅ Upload de imagens
- ✅ Multi-tenancy

## 🚀 Deploy

1. Conectar repositório ao Vercel
2. Configurar variáveis de ambiente
3. Deploy automático

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato com a equipe.
EOF

log "✓ README criado"

# Fase 10: Criar script de setup
log "⚡ Fase 10: Criando script de setup..."

cat > "$NEW_PROJECT_DIR/setup.sh" << 'EOF'
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
EOF

chmod +x "$NEW_PROJECT_DIR/setup.sh"
log "✓ Script de setup criado"

# Fase 11: Limpeza e finalização
log "🧹 Fase 11: Finalizando migração..."

# Criar arquivo de status
cat > "$NEW_PROJECT_DIR/MIGRATION_STATUS.md" << EOF
# 📊 Status da Migração

## ✅ Concluído
- [x] Backup do projeto original
- [x] Estrutura simplificada criada
- [x] Gateway (Next.js) migrado
- [x] Bibliotecas compartilhadas migradas
- [x] Configurações TypeScript
- [x] Configuração do Supabase
- [x] Package.json simplificado
- [x] Scripts de setup

## 🔄 Próximos Passos
- [ ] Configurar Supabase Cloud
- [ ] Migrar microserviços para API Routes
- [ ] Configurar Stripe
- [ ] Testes de funcionalidade
- [ ] Deploy no Vercel

## 📁 Arquivos Migrados
- services/gateway/ → app/, components/, lib/
- libs/types/ → types/
- libs/utils/ → lib/utils/
- libs/design-tokens/ → lib/design-tokens/

## 🚨 Atenção
- Configure as variáveis de ambiente no arquivo .env
- Teste todas as funcionalidades antes do deploy
- Backup original salvo em: $BACKUP_DIR
EOF

log "✅ Migração concluída com sucesso!"
echo ""
echo "🎉 Projeto migrado para: $NEW_PROJECT_DIR"
echo "📦 Backup salvo em: $BACKUP_DIR"
echo ""
echo "📝 Próximos passos:"
echo "1. cd $NEW_PROJECT_DIR"
echo "2. ./setup.sh"
echo "3. Configure as variáveis no .env"
echo "4. npm run dev"
echo ""
echo "🚀 Boa sorte com o novo projeto!"