#!/usr/bin/env node

/**
 * Script para configurar automaticamente as variáveis de ambiente
 * do Supabase em todos os serviços
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bold');
  console.log('='.repeat(60));
}

// Configuração do Supabase
const supabaseConfig = `# ========================================
# CONFIGURAÇÃO DO SUPABASE
# ========================================

# Credenciais do Supabase PostgreSQL
POSTGRES_HOST=aws-0-us-east-2.pooler.supabase.com
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres.ndumbtdngzrotesqlmii
POSTGRES_PASSWORD=9U86JHajBgWNwxdm
PGSSLMODE=require
POSTGRES_SSL=true

# ========================================
# SERVIÇOS
# ========================================

# URLs dos microserviços
CATALOG_SERVICE_URL=http://localhost:5000
ORDERS_SERVICE_URL=http://localhost:6000
COMMISSION_SERVICE_URL=http://localhost:7000

# ========================================
# OUTRAS CONFIGURAÇÕES
# ========================================

# Ambiente
NODE_ENV=development

# Portas dos serviços
PORT=3000
CATALOG_PORT=5000
ORDERS_PORT=6000
COMMISSION_PORT=7000

# Logs
LOG_LEVEL=info
`;

// Serviços para configurar
const services = [
  'services/catalog',
  'services/orders', 
  'services/commission',
  'services/gateway'
];

function createEnvFile(servicePath) {
  const envPath = path.join(servicePath, '.env');
  
  try {
    fs.writeFileSync(envPath, supabaseConfig);
    log(`✅ .env criado em ${servicePath}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Erro ao criar .env em ${servicePath}: ${error.message}`, 'red');
    return false;
  }
}

function createEnvExample(servicePath) {
  const envExamplePath = path.join(servicePath, '.env.example');
  
  try {
    fs.writeFileSync(envExamplePath, supabaseConfig);
    log(`✅ .env.example criado em ${servicePath}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Erro ao criar .env.example em ${servicePath}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  logSection('🔧 CONFIGURANDO VARIÁVEIS DE AMBIENTE DO SUPABASE');
  
  let successCount = 0;
  let totalCount = 0;
  
  // Configurar cada serviço
  for (const service of services) {
    const servicePath = path.join(process.cwd(), service);
    
    if (fs.existsSync(servicePath)) {
      log(`\n📁 Configurando ${service}:`, 'blue');
      
      totalCount += 2; // .env e .env.example
      
      if (createEnvFile(servicePath)) successCount++;
      if (createEnvExample(servicePath)) successCount++;
    } else {
      log(`⚠️  Diretório ${service} não encontrado`, 'yellow');
    }
  }
  
  // Criar .env na raiz do projeto
  log(`\n📁 Configurando raiz do projeto:`, 'blue');
  const rootEnvPath = path.join(process.cwd(), '.env');
  
  try {
    fs.writeFileSync(rootEnvPath, supabaseConfig);
    log(`✅ .env criado na raiz do projeto`, 'green');
    successCount++;
  } catch (error) {
    log(`❌ Erro ao criar .env na raiz: ${error.message}`, 'red');
  }
  
  totalCount++;
  
  // Resumo
  logSection('📊 RESUMO DA CONFIGURAÇÃO');
  log(`✅ Arquivos criados com sucesso: ${successCount}/${totalCount}`, 'green');
  
  if (successCount === totalCount) {
    log('\n🎉 Todas as variáveis de ambiente foram configuradas!', 'green');
    log('\n📝 Próximos passos:', 'blue');
    log('1. Execute: npm run verify:supabase', 'blue');
    log('2. Execute: npm run test:connectivity', 'blue');
    log('3. Teste os serviços individualmente', 'blue');
  } else {
    log('\n⚠️  Alguns arquivos não puderam ser criados', 'yellow');
    log('Verifique as permissões e tente novamente', 'yellow');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  createEnvFile,
  createEnvExample,
  supabaseConfig
}; 