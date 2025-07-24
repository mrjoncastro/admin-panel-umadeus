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
