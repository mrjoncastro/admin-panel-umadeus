# 🚀 Guia de Migração: Docker → Stack Simplificada

## 📋 Visão Geral

Este guia detalha como migrar o projeto monorepo com Docker para uma stack simplificada usando Next.js + Supabase Cloud.

## 🎯 Objetivos da Migração

- ✅ **Eliminar complexidade do Docker**
- ✅ **Reduzir tempo de setup de 30+ min para 5 min**
- ✅ **Melhorar performance de desenvolvimento**
- ✅ **Simplificar deploy e manutenção**
- ✅ **Manter todas as funcionalidades**

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes (Docker) | Depois (Simplificado) |
|---------|----------------|----------------------|
| **Setup** | 30+ minutos | 5 minutos |
| **Hot Reload** | 3-8 segundos | <1 segundo |
| **Memória** | 4-8GB | 500MB-1GB |
| **Deploy** | Complexo | Automático |
| **Manutenção** | Alta | Baixa |

## 🚀 Executando a Migração

### **Passo 1: Preparação**
```bash
# 1. Certifique-se de estar no diretório raiz do projeto
cd /caminho/para/seu/projeto

# 2. Verifique se o script de migração existe
ls -la scripts/migrate-to-simplified.sh

# 3. Torne o script executável
chmod +x scripts/migrate-to-simplified.sh
```

### **Passo 2: Executar Migração**
```bash
# Executar o script de migração
./scripts/migrate-to-simplified.sh
```

**O script irá:**
- ✅ Criar backup do projeto atual
- ✅ Migrar estrutura do Gateway (Next.js)
- ✅ Migrar bibliotecas compartilhadas
- ✅ Criar configurações simplificadas
- ✅ Gerar novo projeto em `marketplace-simplified/`

### **Passo 3: Configurar Novo Projeto**
```bash
# 1. Entrar no novo projeto
cd marketplace-simplified

# 2. Executar setup automático
./setup.sh

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais
```

### **Passo 4: Configurar Supabase Cloud**

#### **4.1 Criar Projeto no Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Aguarde a configuração (2-3 minutos)

#### **4.2 Obter Credenciais**
1. Vá em **Settings > API**
2. Copie as credenciais:
   - Project URL
   - anon/public key
   - service_role key

#### **4.3 Configurar .env**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Stripe Configuration (opcional por enquanto)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### **Passo 5: Testar o Projeto**
```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev

# 3. Acessar
# http://localhost:3000
```

## 🔧 Migração de Microserviços

### **Convertendo para API Routes**

#### **Auth Service → API Routes**
```bash
# Criar estrutura
mkdir -p app/api/auth

# Migrar endpoints
# services/auth/ → app/api/auth/
```

#### **Catalog Service → API Routes**
```bash
# Criar estrutura
mkdir -p app/api/catalog

# Migrar endpoints
# services/catalog/ → app/api/catalog/
```

#### **Orders Service → API Routes**
```bash
# Criar estrutura
mkdir -p app/api/orders

# Migrar endpoints
# services/orders/ → app/api/orders/
```

#### **Commission Service → API Routes**
```bash
# Criar estrutura
mkdir -p app/api/commission

# Migrar endpoints
# services/commission/ → app/api/commission/
```

## 📦 Migração de Banco de Dados

### **1. Exportar Schema Local**
```bash
# Se estiver usando Supabase local
supabase db dump --data-only > backup.sql
```

### **2. Importar para Supabase Cloud**
1. Acesse o **SQL Editor** no Supabase Dashboard
2. Execute o script de criação das tabelas
3. Importe os dados se necessário

### **3. Configurar RLS (Row Level Security)**
```sql
-- Exemplo de policy para produtos
CREATE POLICY "Produtos visíveis para todos" ON produtos
FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem modificar" ON produtos
FOR ALL USING (auth.role() = 'admin');
```

## 🧪 Testes e Validação

### **Checklist de Testes**
- [ ] **Autenticação**
  - [ ] Registro de usuário
  - [ ] Login/Logout
  - [ ] Recuperação de senha

- [ ] **Produtos**
  - [ ] Listagem de produtos
  - [ ] Detalhes do produto
  - [ ] Busca e filtros
  - [ ] Upload de imagens

- [ ] **Carrinho**
  - [ ] Adicionar produtos
  - [ ] Remover produtos
  - [ ] Atualizar quantidades

- [ ] **Checkout**
  - [ ] Processamento de pedido
  - [ ] Integração com Stripe
  - [ ] Confirmação de pagamento

- [ ] **Admin**
  - [ ] Painel administrativo
  - [ ] Gerenciamento de produtos
  - [ ] Relatórios

## 🚀 Deploy

### **Vercel (Recomendado)**
```bash
# 1. Conectar repositório
# 2. Configurar variáveis de ambiente
# 3. Deploy automático
```

### **Configuração no Vercel**
1. Vá para [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## 📊 Monitoramento

### **Ferramentas Recomendadas**
- **Vercel Analytics** - Performance e métricas
- **Supabase Dashboard** - Banco de dados e logs
- **Stripe Dashboard** - Pagamentos e transações
- **Sentry** - Monitoramento de erros

## 🚨 Troubleshooting

### **Problemas Comuns**

#### **1. Erro de Conexão com Supabase**
```bash
# Verificar variáveis de ambiente
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Testar conexão
curl -X GET "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

#### **2. Erro de Build**
```bash
# Limpar cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### **3. Erro de TypeScript**
```bash
# Verificar tipos
npm run type-check

# Atualizar tipos se necessário
npm install @types/node@latest
```

## 📈 Performance

### **Otimizações Recomendadas**
```typescript
// 1. Image Optimization
import Image from 'next/image'
<Image src="/product.jpg" width={400} height={300} priority />

// 2. Supabase com cache
const { data } = await supabase
  .from('products')
  .select('*')
  .cache(300) // 5 minutos

// 3. Edge Functions
export const runtime = 'edge'

// 4. Lazy Loading
const ProductModal = dynamic(() => import('./ProductModal'))
```

## 🎉 Conclusão

### **Benefícios Alcançados**
- ✅ **Setup 6x mais rápido**
- ✅ **Hot reload instantâneo**
- ✅ **Menos recursos consumidos**
- ✅ **Deploy simplificado**
- ✅ **Manutenção mais fácil**

### **Próximos Passos**
1. Testar todas as funcionalidades
2. Configurar monitoramento
3. Otimizar performance
4. Documentar mudanças
5. Treinar equipe

## 📞 Suporte

Para dúvidas ou problemas durante a migração:
1. Consulte a documentação do Supabase
2. Verifique os logs de erro
3. Entre em contato com a equipe de desenvolvimento

**Boa sorte com a migração! 🚀**