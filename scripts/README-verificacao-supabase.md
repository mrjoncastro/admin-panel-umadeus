# Verificação do Supabase após Migração

Este documento explica como verificar se o Supabase está sendo consumido corretamente após a migração do PocketBase.

## 📋 Pré-requisitos

1. **Migração concluída**: Os dados devem ter sido migrados do PocketBase para o Supabase
2. **Variáveis de ambiente configuradas**: Configure as variáveis do Supabase
3. **Scripts de verificação**: Os scripts devem estar na pasta `scripts/`

## 🔧 Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Supabase/PostgreSQL
POSTGRES_HOST=<seu-host-supabase>
POSTGRES_PORT=5432
POSTGRES_DB=<seu-banco>
POSTGRES_USER=<seu-usuario>
POSTGRES_PASSWORD=<sua-senha>
POSTGRES_SSL=true

# URLs dos serviços (opcional)
CATALOG_SERVICE_URL=http://localhost:5000
ORDERS_SERVICE_URL=http://localhost:6000
COMMISSION_SERVICE_URL=http://localhost:7000
```

## 🚀 Scripts de Verificação

### 1. Verificação Completa do Supabase

```bash
npm run verify:all
```

Este comando executa todos os scripts de verificação em sequência.

### 2. Verificação Individual dos Scripts

#### Verificar dados e estrutura do Supabase
```bash
npm run verify:supabase
```

**O que verifica:**
- ✅ Variáveis de ambiente
- ✅ Conexão com o banco
- ✅ Existência das tabelas migradas
- ✅ Contagem de registros
- ✅ Row Level Security (RLS)
- ✅ Dados de exemplo
- ✅ Configurações do Supabase
- ✅ Queries multi-tenant

#### Verificar configuração dos serviços
```bash
npm run verify:services
```

**O que verifica:**
- ✅ Configuração do serviço Catalog
- ✅ Configuração do serviço Orders
- ✅ Configuração do serviço Commission
- ✅ Configuração do Gateway (Next.js)
- ✅ Docker Compose
- ✅ Variáveis de ambiente nos serviços
- ✅ Scripts de migração

#### Testar conectividade
```bash
npm run test:connectivity
```

**O que verifica:**
- ✅ Conectividade com o host do Supabase
- ✅ Conexão com o banco de dados
- ✅ Queries básicas
- ✅ Multi-tenancy
- ✅ Row Level Security
- ✅ Performance das queries
- ✅ Conectividade com serviços

## 📊 Interpretação dos Resultados

### ✅ Verde - Tudo OK
- Configuração correta
- Dados migrados com sucesso
- Funcionalidades operacionais

### ⚠️ Amarelo - Atenção
- Configuração parcial
- Dados incompletos
- Funcionalidades limitadas

### ❌ Vermelho - Problema
- Configuração incorreta
- Dados não migrados
- Funcionalidades quebradas

## 🔍 Verificações Manuais

### 1. Verificar no Painel do Supabase

1. Acesse o painel do Supabase
2. Vá para **Table Editor**
3. Verifique se as tabelas existem:
   - `m24_clientes`
   - `usuarios`
   - `campos`
   - `categorias`
   - `produtos`
   - `eventos`
   - `pedidos`
   - `inscricoes`
   - `clientes_config`
   - `manifesto_clientes`

### 2. Verificar Row Level Security

1. Vá para **Authentication > Policies**
2. Verifique se as policies estão configuradas
3. Teste o isolamento de dados por tenant

### 3. Verificar Storage

1. Vá para **Storage**
2. Verifique se os buckets foram criados
3. Confirme se os arquivos foram migrados

## 🛠️ Solução de Problemas

### Problema: Variáveis de ambiente não encontradas

**Solução:**
```bash
# Verificar se o arquivo .env existe
ls -la .env

# Criar arquivo .env se não existir
cp .env.example .env

# Editar com as credenciais corretas
nano .env
```

### Problema: Conexão com banco falha

**Solução:**
1. Verificar credenciais do Supabase
2. Confirmar se o host está correto
3. Verificar se o SSL está configurado
4. Testar conectividade de rede

### Problema: Tabelas não encontradas

**Solução:**
1. Verificar se a migração foi executada
2. Executar novamente o script de migração
3. Verificar logs de erro da migração

### Problema: RLS não configurado

**Solução:**
1. Executar o script `post-migration-setup.sql`
2. Verificar se as policies foram criadas
3. Testar o isolamento de dados

## 📝 Próximos Passos

Após verificar que o Supabase está funcionando:

1. **Configurar serviços**: Atualizar cada serviço para usar Supabase
2. **Testar funcionalidades**: Verificar se a aplicação funciona
3. **Migrar arquivos**: Executar migração de arquivos para Supabase Storage
4. **Monitorar**: Configurar alertas e monitoramento
5. **Documentar**: Atualizar documentação da aplicação

## 🔗 Links Úteis

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Migração](docs/v2/migracao_pocketbase_supabase.md)
- [Schema do Supabase](docs/v2/supabase_schema.sql)
- [Arquitetura](docs/v2/arquitetura_deploy_escalabilidade.md)

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs dos scripts
2. Consulte a documentação do Supabase
3. Revise os scripts de migração
4. Teste as configurações manualmente 