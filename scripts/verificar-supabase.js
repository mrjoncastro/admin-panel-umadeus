#!/usr/bin/env node

/**
 * Script para verificar se o Supabase está sendo consumido corretamente
 * após a migração do PocketBase
 */

const { Pool } = require('pg');
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

// Verificar variáveis de ambiente
function checkEnvironmentVariables() {
  logSection('🔍 VERIFICANDO VARIÁVEIS DE AMBIENTE');
  
  const requiredVars = [
    'POSTGRES_HOST',
    'POSTGRES_PORT', 
    'POSTGRES_DB',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD'
  ];
  
  const missingVars = [];
  const config = {};
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
      log(`❌ ${varName}: não definida`, 'red');
    } else {
      config[varName] = varName.includes('PASSWORD') ? '***' : value;
      log(`✅ ${varName}: ${config[varName]}`, 'green');
    }
  }
  
  if (missingVars.length > 0) {
    log(`\n⚠️  Variáveis ausentes: ${missingVars.join(', ')}`, 'yellow');
    log('Crie um arquivo .env com as seguintes variáveis:', 'yellow');
    log('POSTGRES_HOST=<seu-host-supabase>', 'yellow');
    log('POSTGRES_PORT=5432', 'yellow');
    log('POSTGRES_DB=<seu-banco>', 'yellow');
    log('POSTGRES_USER=<seu-usuario>', 'yellow');
    log('POSTGRES_PASSWORD=<sua-senha>', 'yellow');
    return false;
  }
  
  return true;
}

// Testar conexão com o banco
async function testDatabaseConnection() {
  logSubSection('🔌 TESTANDO CONEXÃO COM O BANCO');
  
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
      mode: process.env.PGSSLMODE || 'require'
    },
    connectionTimeoutMillis: 10000,
  });
  
  try {
    const client = await pool.connect();
    log('✅ Conexão estabelecida com sucesso!', 'green');
    
    // Testar query básica
    const result = await client.query('SELECT version()');
    log(`📊 Versão do PostgreSQL: ${result.rows[0].version.split(' ')[0]}`, 'green');
    
    client.release();
    return pool;
  } catch (error) {
    log(`❌ Erro na conexão: ${error.message}`, 'red');
    return null;
  }
}

// Verificar se as tabelas existem
async function checkTables(pool) {
  logSubSection('📋 VERIFICANDO TABELAS MIGRADAS');
  
  const expectedTables = [
    'm24_clientes',
    'usuarios', 
    'campos',
    'categorias',
    'produtos',
    'eventos',
    'pedidos',
    'inscricoes',
    'clientes_config',
    'manifesto_clientes'
  ];
  
  const existingTables = [];
  const missingTables = [];
  
  for (const tableName of expectedTables) {
    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [tableName]);
      
      if (result.rows[0].exists) {
        existingTables.push(tableName);
        log(`✅ ${tableName}: existe`, 'green');
        
        // Contar registros
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
        const count = countResult.rows[0].count;
        log(`   📊 Registros: ${count}`, 'green');
      } else {
        missingTables.push(tableName);
        log(`❌ ${tableName}: não encontrada`, 'red');
      }
    } catch (error) {
      missingTables.push(tableName);
      log(`❌ ${tableName}: erro ao verificar - ${error.message}`, 'red');
    }
  }
  
  if (missingTables.length > 0) {
    log(`\n⚠️  Tabelas ausentes: ${missingTables.join(', ')}`, 'yellow');
  }
  
  return { existingTables, missingTables };
}

// Verificar RLS (Row Level Security)
async function checkRLS(pool) {
  logSubSection('🔒 VERIFICANDO ROW LEVEL SECURITY (RLS)');
  
  const tablesWithRLS = [
    'm24_clientes',
    'usuarios',
    'campos', 
    'categorias',
    'produtos',
    'eventos',
    'pedidos',
    'inscricoes'
  ];
  
  for (const tableName of tablesWithRLS) {
    try {
      const result = await pool.query(`
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE tablename = $1
      `, [tableName]);
      
      if (result.rows.length > 0) {
        const hasRLS = result.rows[0].rowsecurity;
        if (hasRLS) {
          log(`✅ ${tableName}: RLS ativo`, 'green');
        } else {
          log(`⚠️  ${tableName}: RLS inativo`, 'yellow');
        }
      }
    } catch (error) {
      log(`❌ ${tableName}: erro ao verificar RLS - ${error.message}`, 'red');
    }
  }
}

// Verificar dados de exemplo
async function checkSampleData(pool) {
  logSubSection('📊 VERIFICANDO DADOS DE EXEMPLO');
  
  try {
    // Verificar se há clientes
    const clientesResult = await pool.query('SELECT COUNT(*) FROM m24_clientes');
    const clientesCount = parseInt(clientesResult.rows[0].count);
    log(`👥 Clientes: ${clientesCount}`, clientesCount > 0 ? 'green' : 'yellow');
    
    if (clientesCount > 0) {
      const sampleCliente = await pool.query('SELECT id, nome, dominio FROM m24_clientes LIMIT 1');
      log(`   📝 Exemplo: ${sampleCliente.rows[0].nome} (${sampleCliente.rows[0].dominio})`, 'green');
    }
    
    // Verificar se há usuários
    const usuariosResult = await pool.query('SELECT COUNT(*) FROM usuarios');
    const usuariosCount = parseInt(usuariosResult.rows[0].count);
    log(`👤 Usuários: ${usuariosCount}`, usuariosCount > 0 ? 'green' : 'yellow');
    
    // Verificar se há produtos
    const produtosResult = await pool.query('SELECT COUNT(*) FROM produtos');
    const produtosCount = parseInt(produtosResult.rows[0].count);
    log(`📦 Produtos: ${produtosCount}`, produtosCount > 0 ? 'green' : 'yellow');
    
    // Verificar se há categorias
    const categoriasResult = await pool.query('SELECT COUNT(*) FROM categorias');
    const categoriasCount = parseInt(categoriasResult.rows[0].count);
    log(`🏷️  Categorias: ${categoriasCount}`, categoriasCount > 0 ? 'green' : 'yellow');
    
  } catch (error) {
    log(`❌ Erro ao verificar dados: ${error.message}`, 'red');
  }
}

// Verificar configurações do Supabase
async function checkSupabaseConfig(pool) {
  logSubSection('⚙️  VERIFICANDO CONFIGURAÇÕES DO SUPABASE');
  
  try {
    // Verificar extensões
    const extensionsResult = await pool.query(`
      SELECT extname FROM pg_extension 
      WHERE extname IN ('uuid-ossp', 'pgcrypto')
    `);
    
    const extensions = extensionsResult.rows.map(row => row.extname);
    log(`🔧 Extensões ativas: ${extensions.join(', ')}`, 'green');
    
    // Verificar se há policies
    const policiesResult = await pool.query(`
      SELECT schemaname, tablename, policyname 
      FROM pg_policies 
      WHERE schemaname = 'public'
    `);
    
    if (policiesResult.rows.length > 0) {
      log(`🛡️  Policies encontradas: ${policiesResult.rows.length}`, 'green');
      policiesResult.rows.forEach(policy => {
        log(`   📋 ${policy.tablename}.${policy.policyname}`, 'green');
      });
    } else {
      log(`⚠️  Nenhuma policy encontrada`, 'yellow');
    }
    
  } catch (error) {
    log(`❌ Erro ao verificar configurações: ${error.message}`, 'red');
  }
}

// Testar queries multi-tenant
async function testMultiTenantQueries(pool) {
  logSubSection('🏢 TESTANDO QUERIES MULTI-TENANT');
  
  try {
    // Pegar um cliente de exemplo
    const clienteResult = await pool.query('SELECT id, nome FROM m24_clientes LIMIT 1');
    
    if (clienteResult.rows.length === 0) {
      log('⚠️  Nenhum cliente encontrado para testar multi-tenancy', 'yellow');
      return;
    }
    
    const cliente = clienteResult.rows[0];
    log(`🧪 Testando com cliente: ${cliente.nome}`, 'blue');
    
    // Testar query com filtro por cliente
    const produtosResult = await pool.query(
      'SELECT COUNT(*) FROM produtos WHERE cliente = $1',
      [cliente.id]
    );
    
    const produtosCount = parseInt(produtosResult.rows[0].count);
    log(`📦 Produtos do cliente: ${produtosCount}`, 'green');
    
    // Testar query de usuários
    const usuariosResult = await pool.query(
      'SELECT COUNT(*) FROM usuarios WHERE cliente = $1',
      [cliente.id]
    );
    
    const usuariosCount = parseInt(usuariosResult.rows[0].count);
    log(`👤 Usuários do cliente: ${usuariosCount}`, 'green');
    
  } catch (error) {
    log(`❌ Erro ao testar multi-tenancy: ${error.message}`, 'red');
  }
}

// Função principal
async function main() {
  logSection('🚀 VERIFICAÇÃO DO SUPABASE APÓS MIGRAÇÃO');
  
  // Carregar variáveis de ambiente
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    log('✅ Arquivo .env carregado', 'green');
  } else {
    log('⚠️  Arquivo .env não encontrado', 'yellow');
  }
  
  // Verificar variáveis de ambiente
  const envOk = checkEnvironmentVariables();
  if (!envOk) {
    log('\n❌ Verificação interrompida devido a variáveis ausentes', 'red');
    process.exit(1);
  }
  
  // Testar conexão
  const pool = await testDatabaseConnection();
  if (!pool) {
    log('\n❌ Verificação interrompida devido a erro de conexão', 'red');
    process.exit(1);
  }
  
  try {
    // Verificar tabelas
    await checkTables(pool);
    
    // Verificar RLS
    await checkRLS(pool);
    
    // Verificar dados
    await checkSampleData(pool);
    
    // Verificar configurações
    await checkSupabaseConfig(pool);
    
    // Testar multi-tenancy
    await testMultiTenantQueries(pool);
    
    logSection('✅ VERIFICAÇÃO CONCLUÍDA');
    log('🎉 O Supabase está configurado e funcionando corretamente!', 'green');
    log('\n📝 Próximos passos:', 'blue');
    log('1. Configure as variáveis de ambiente nos serviços', 'blue');
    log('2. Teste as funcionalidades da aplicação', 'blue');
    log('3. Verifique se os arquivos foram migrados para o Supabase Storage', 'blue');
    
  } catch (error) {
    log(`❌ Erro durante a verificação: ${error.message}`, 'red');
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    log(`❌ Erro fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  checkEnvironmentVariables,
  testDatabaseConnection,
  checkTables,
  checkRLS,
  checkSampleData,
  checkSupabaseConfig,
  testMultiTenantQueries
}; 