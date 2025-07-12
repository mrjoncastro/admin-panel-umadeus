#!/usr/bin/env node

/**
 * Script para verificar se os serviços estão configurados corretamente
 * para usar o Supabase após a migração
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

function logSubSection(title) {
  console.log('\n' + '-'.repeat(40));
  log(title, 'blue');
  console.log('-'.repeat(40));
}

// Verificar configuração do serviço catalog
function checkCatalogService() {
  logSubSection('📦 VERIFICANDO SERVIÇO CATALOG');
  
  const catalogPath = path.join(process.cwd(), 'services', 'catalog');
  const connectionFile = path.join(catalogPath, 'src', 'database', 'connection.ts');
  
  if (!fs.existsSync(connectionFile)) {
    log('❌ Arquivo de conexão não encontrado', 'red');
    return false;
  }
  
  const content = fs.readFileSync(connectionFile, 'utf8');
  
  // Verificar se usa variáveis de ambiente do Supabase
  const usesEnvVars = content.includes('process.env[\'POSTGRES_HOST\']') ||
                     content.includes('process.env.POSTGRES_HOST');
  
  if (usesEnvVars) {
    log('✅ Usa variáveis de ambiente do Supabase', 'green');
  } else {
    log('❌ Não usa variáveis de ambiente do Supabase', 'red');
  }
  
  // Verificar se tem configuração de RLS
  const hasRLS = content.includes('setupRLS') || content.includes('Row Level Security');
  
  if (hasRLS) {
    log('✅ Configuração de RLS encontrada', 'green');
  } else {
    log('⚠️  Configuração de RLS não encontrada', 'yellow');
  }
  
  // Verificar package.json
  const packageJsonPath = path.join(catalogPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.dependencies && packageJson.dependencies.pg) {
      log('✅ Dependência pg (PostgreSQL) encontrada', 'green');
    } else {
      log('❌ Dependência pg não encontrada', 'red');
    }
  }
  
  return true;
}

// Verificar configuração do serviço orders
function checkOrdersService() {
  logSubSection('📋 VERIFICANDO SERVIÇO ORDERS');
  
  const ordersPath = path.join(process.cwd(), 'services', 'orders');
  
  if (!fs.existsSync(ordersPath)) {
    log('⚠️  Diretório do serviço orders não encontrado', 'yellow');
    return false;
  }
  
  const srcPath = path.join(ordersPath, 'src');
  if (fs.existsSync(srcPath)) {
    const files = fs.readdirSync(srcPath);
    const hasDatabaseFiles = files.some(file => 
      file.includes('database') || file.includes('connection') || file.includes('db')
    );
    
    if (hasDatabaseFiles) {
      log('✅ Arquivos de banco encontrados', 'green');
    } else {
      log('⚠️  Arquivos de banco não encontrados', 'yellow');
    }
  }
  
  // Verificar package.json
  const packageJsonPath = path.join(ordersPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.dependencies && packageJson.dependencies.pg) {
      log('✅ Dependência pg (PostgreSQL) encontrada', 'green');
    } else {
      log('⚠️  Dependência pg não encontrada', 'yellow');
    }
  }
  
  return true;
}

// Verificar configuração do serviço commission
function checkCommissionService() {
  logSubSection('💰 VERIFICANDO SERVIÇO COMMISSION');
  
  const commissionPath = path.join(process.cwd(), 'services', 'commission');
  
  if (!fs.existsSync(commissionPath)) {
    log('⚠️  Diretório do serviço commission não encontrado', 'yellow');
    return false;
  }
  
  const srcPath = path.join(commissionPath, 'src');
  if (fs.existsSync(srcPath)) {
    const files = fs.readdirSync(srcPath);
    const hasDatabaseFiles = files.some(file => 
      file.includes('database') || file.includes('connection') || file.includes('db')
    );
    
    if (hasDatabaseFiles) {
      log('✅ Arquivos de banco encontrados', 'green');
    } else {
      log('⚠️  Arquivos de banco não encontrados', 'yellow');
    }
  }
  
  // Verificar package.json
  const packageJsonPath = path.join(commissionPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.dependencies && packageJson.dependencies.pg) {
      log('✅ Dependência pg (PostgreSQL) encontrada', 'green');
    } else {
      log('⚠️  Dependência pg não encontrada', 'yellow');
    }
  }
  
  return true;
}

// Verificar configuração do gateway (Next.js)
function checkGatewayService() {
  logSubSection('🌐 VERIFICANDO SERVIÇO GATEWAY');
  
  const gatewayPath = path.join(process.cwd(), 'services', 'gateway');
  
  // Verificar se ainda usa PocketBase
  const pocketbaseFile = path.join(gatewayPath, 'lib', 'pocketbase.ts');
  if (fs.existsSync(pocketbaseFile)) {
    log('⚠️  Ainda usa PocketBase - precisa ser migrado para Supabase', 'yellow');
    
    const content = fs.readFileSync(pocketbaseFile, 'utf8');
    if (content.includes('PB_URL') || content.includes('PocketBase')) {
      log('   📝 Usa configuração do PocketBase', 'yellow');
    }
  }
  
  // Verificar se há configuração do Supabase
  const supabaseFiles = [
    path.join(gatewayPath, 'lib', 'supabase.ts'),
    path.join(gatewayPath, 'lib', 'supabaseClient.ts'),
    path.join(gatewayPath, 'lib', 'database.ts')
  ];
  
  let hasSupabaseConfig = false;
  for (const file of supabaseFiles) {
    if (fs.existsSync(file)) {
      log(`✅ Configuração do Supabase encontrada: ${path.basename(file)}`, 'green');
      hasSupabaseConfig = true;
    }
  }
  
  if (!hasSupabaseConfig) {
    log('⚠️  Configuração do Supabase não encontrada', 'yellow');
  }
  
  // Verificar package.json
  const packageJsonPath = path.join(gatewayPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.dependencies) {
      const hasSupabase = packageJson.dependencies['@supabase/supabase-js'];
      const hasPg = packageJson.dependencies.pg;
      
      if (hasSupabase) {
        log('✅ Dependência @supabase/supabase-js encontrada', 'green');
      } else {
        log('⚠️  Dependência @supabase/supabase-js não encontrada', 'yellow');
      }
      
      if (hasPg) {
        log('✅ Dependência pg (PostgreSQL) encontrada', 'green');
      } else {
        log('⚠️  Dependência pg não encontrada', 'yellow');
      }
    }
  }
  
  return true;
}

// Verificar docker-compose.yml
function checkDockerCompose() {
  logSubSection('🐳 VERIFICANDO DOCKER COMPOSE');
  
  const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
  
  if (!fs.existsSync(dockerComposePath)) {
    log('❌ docker-compose.yml não encontrado', 'red');
    return false;
  }
  
  const content = fs.readFileSync(dockerComposePath, 'utf8');
  
  // Verificar se ainda referencia PocketBase
  if (content.includes('pocketbase')) {
    log('⚠️  Ainda referencia PocketBase no docker-compose', 'yellow');
  }
  
  // Verificar se tem configuração do Supabase
  if (content.includes('POSTGRES_HOST') || content.includes('SUPABASE')) {
    log('✅ Configuração do Supabase encontrada', 'green');
  } else {
    log('⚠️  Configuração do Supabase não encontrada', 'yellow');
  }
  
  // Verificar se tem postgres local (para desenvolvimento)
  if (content.includes('postgres:')) {
    log('📝 Postgres local configurado para desenvolvimento', 'blue');
  }
  
  return true;
}

// Verificar variáveis de ambiente nos serviços
function checkServiceEnvironmentVariables() {
  logSubSection('🔧 VERIFICANDO VARIÁVEIS DE AMBIENTE NOS SERVIÇOS');
  
  const services = ['catalog', 'orders', 'commission', 'gateway'];
  const requiredVars = ['POSTGRES_HOST', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD'];
  
  for (const service of services) {
    const servicePath = path.join(process.cwd(), 'services', service);
    const envPath = path.join(servicePath, '.env');
    const envExamplePath = path.join(servicePath, '.env.example');
    
    log(`\n📁 ${service}:`, 'blue');
    
    if (fs.existsSync(envPath)) {
      log('   ✅ Arquivo .env existe', 'green');
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      const missingVars = [];
      
      for (const varName of requiredVars) {
        if (!envContent.includes(varName)) {
          missingVars.push(varName);
        }
      }
      
      if (missingVars.length > 0) {
        log(`   ⚠️  Variáveis ausentes: ${missingVars.join(', ')}`, 'yellow');
      } else {
        log('   ✅ Todas as variáveis necessárias encontradas', 'green');
      }
    } else {
      log('   ❌ Arquivo .env não existe', 'red');
    }
    
    if (fs.existsSync(envExamplePath)) {
      log('   📝 Arquivo .env.example existe', 'green');
    } else {
      log('   ⚠️  Arquivo .env.example não existe', 'yellow');
    }
  }
}

// Verificar se há scripts de migração
function checkMigrationScripts() {
  logSubSection('📜 VERIFICANDO SCRIPTS DE MIGRAÇÃO');
  
  const scriptsPath = path.join(process.cwd(), 'scripts');
  
  if (!fs.existsSync(scriptsPath)) {
    log('❌ Diretório scripts não encontrado', 'red');
    return false;
  }
  
  const migrationScripts = [
    'migracao-completa.sh',
    'migrar-arquivos-apos-dados.js',
    'post-migration-setup.sql',
    'verificar-supabase.js'
  ];
  
  for (const script of migrationScripts) {
    const scriptPath = path.join(scriptsPath, script);
    if (fs.existsSync(scriptPath)) {
      log(`✅ ${script} encontrado`, 'green');
    } else {
      log(`⚠️  ${script} não encontrado`, 'yellow');
    }
  }
  
  return true;
}

// Gerar relatório de recomendações
function generateRecommendations() {
  logSection('📋 RECOMENDAÇÕES PARA COMPLETAR A MIGRAÇÃO');
  
  log('\n🔧 Configurações necessárias:', 'blue');
  log('1. Configure as variáveis de ambiente em cada serviço:', 'blue');
  log('   POSTGRES_HOST=<seu-host-supabase>', 'blue');
  log('   POSTGRES_PORT=5432', 'blue');
  log('   POSTGRES_DB=<seu-banco>', 'blue');
  log('   POSTGRES_USER=<seu-usuario>', 'blue');
  log('   POSTGRES_PASSWORD=<sua-senha>', 'blue');
  
  log('\n🌐 Para o Gateway (Next.js):', 'blue');
  log('1. Instale @supabase/supabase-js:', 'blue');
  log('   npm install @supabase/supabase-js', 'blue');
  log('2. Crie lib/supabaseClient.ts com configuração do Supabase', 'blue');
  log('3. Migre as funções que usam PocketBase para Supabase', 'blue');
  
  log('\n📦 Para os microserviços:', 'blue');
  log('1. Instale pg (PostgreSQL):', 'blue');
  log('   npm install pg @types/pg', 'blue');
  log('2. Configure conexão com Supabase em src/database/connection.ts', 'blue');
  log('3. Implemente RLS (Row Level Security) para multi-tenancy', 'blue');
  
  log('\n🐳 Para Docker:', 'blue');
  log('1. Atualize docker-compose.yml para remover PocketBase', 'blue');
  log('2. Configure variáveis de ambiente para Supabase', 'blue');
  log('3. Mantenha postgres local apenas para desenvolvimento', 'blue');
  
  log('\n🧪 Testes:', 'blue');
  log('1. Execute o script de verificação:', 'blue');
  log('   node scripts/verificar-supabase.js', 'blue');
  log('2. Teste as funcionalidades principais da aplicação', 'blue');
  log('3. Verifique se os arquivos foram migrados para Supabase Storage', 'blue');
}

// Função principal
function main() {
  logSection('🔍 VERIFICAÇÃO DOS SERVIÇOS PARA SUPABASE');
  
  // Verificar serviços
  checkCatalogService();
  checkOrdersService();
  checkCommissionService();
  checkGatewayService();
  
  // Verificar configurações
  checkDockerCompose();
  checkServiceEnvironmentVariables();
  checkMigrationScripts();
  
  // Gerar recomendações
  generateRecommendations();
  
  logSection('✅ VERIFICAÇÃO CONCLUÍDA');
  log('📝 Revise as recomendações acima para completar a migração', 'blue');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  checkCatalogService,
  checkOrdersService,
  checkCommissionService,
  checkGatewayService,
  checkDockerCompose,
  checkServiceEnvironmentVariables,
  checkMigrationScripts,
  generateRecommendations
}; 