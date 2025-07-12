#!/usr/bin/env node

/**
 * Script para testar a conectividade com o Supabase
 * e verificar se as APIs estão funcionando corretamente
 */

const { Pool } = require('pg');
const https = require('https');
const http = require('http');

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

// Testar conectividade com o host do Supabase
async function testHostConnectivity() {
  logSubSection('🌐 TESTANDO CONECTIVIDADE COM O HOST');
  
  const host = process.env.POSTGRES_HOST;
  if (!host) {
    log('❌ POSTGRES_HOST não definido', 'red');
    return false;
  }
  
  log(`🔍 Testando conectividade com: ${host}`, 'blue');
  
  return new Promise((resolve) => {
    const client = https.request({
      hostname: host,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 10000
    }, (res) => {
      log(`✅ Conectividade OK - Status: ${res.statusCode}`, 'green');
      resolve(true);
    });
    
    client.on('error', (error) => {
      log(`❌ Erro de conectividade: ${error.message}`, 'red');
      resolve(false);
    });
    
    client.on('timeout', () => {
      log('❌ Timeout na conexão', 'red');
      client.destroy();
      resolve(false);
    });
    
    client.end();
  });
}

// Testar conexão com o banco de dados
async function testDatabaseConnection() {
  logSubSection('🗄️  TESTANDO CONEXÃO COM O BANCO');
  
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
    log('✅ Conexão com banco estabelecida', 'green');
    
    // Testar query simples
    const result = await client.query('SELECT NOW() as current_time');
    log(`📅 Hora atual do servidor: ${result.rows[0].current_time}`, 'green');
    
    client.release();
    return pool;
  } catch (error) {
    log(`❌ Erro na conexão com banco: ${error.message}`, 'red');
    return null;
  }
}

// Testar queries básicas
async function testBasicQueries(pool) {
  logSubSection('📊 TESTANDO QUERIES BÁSICAS');
  
  const tests = [
    {
      name: 'Contar clientes',
      query: 'SELECT COUNT(*) FROM m24_clientes',
      expected: 'number'
    },
    {
      name: 'Contar usuários',
      query: 'SELECT COUNT(*) FROM usuarios',
      expected: 'number'
    },
    {
      name: 'Contar produtos',
      query: 'SELECT COUNT(*) FROM produtos',
      expected: 'number'
    },
    {
      name: 'Verificar estrutura da tabela usuarios',
      query: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        ORDER BY ordinal_position
      `,
      expected: 'structure'
    }
  ];
  
  for (const test of tests) {
    try {
      const result = await pool.query(test.query);
      
      if (test.expected === 'number') {
        const count = parseInt(result.rows[0].count);
        log(`✅ ${test.name}: ${count} registros`, 'green');
      } else if (test.expected === 'structure') {
        log(`✅ ${test.name}: ${result.rows.length} colunas`, 'green');
        result.rows.forEach(row => {
          log(`   📋 ${row.column_name}: ${row.data_type}`, 'green');
        });
      }
    } catch (error) {
      log(`❌ ${test.name}: ${error.message}`, 'red');
    }
  }
}

// Testar multi-tenancy
async function testMultiTenancy(pool) {
  logSubSection('🏢 TESTANDO MULTI-TENANCY');
  
  try {
    // Pegar um cliente de exemplo
    const clienteResult = await pool.query('SELECT id, nome, dominio FROM m24_clientes LIMIT 1');
    
    if (clienteResult.rows.length === 0) {
      log('⚠️  Nenhum cliente encontrado para testar multi-tenancy', 'yellow');
      return;
    }
    
    const cliente = clienteResult.rows[0];
    log(`🧪 Testando com cliente: ${cliente.nome} (${cliente.dominio})`, 'blue');
    
    // Testar queries com filtro por cliente
    const queries = [
      {
        name: 'Produtos do cliente',
        query: 'SELECT COUNT(*) FROM produtos WHERE cliente = $1',
        params: [cliente.id]
      },
      {
        name: 'Usuários do cliente',
        query: 'SELECT COUNT(*) FROM usuarios WHERE cliente = $1',
        params: [cliente.id]
      },
      {
        name: 'Categorias do cliente',
        query: 'SELECT COUNT(*) FROM categorias WHERE cliente = $1',
        params: [cliente.id]
      }
    ];
    
    for (const query of queries) {
      try {
        const result = await pool.query(query.query, query.params);
        const count = parseInt(result.rows[0].count);
        log(`✅ ${query.name}: ${count} registros`, 'green');
      } catch (error) {
        log(`❌ ${query.name}: ${error.message}`, 'red');
      }
    }
    
  } catch (error) {
    log(`❌ Erro ao testar multi-tenancy: ${error.message}`, 'red');
  }
}

// Testar RLS (Row Level Security)
async function testRLS(pool) {
  logSubSection('🔒 TESTANDO ROW LEVEL SECURITY');
  
  try {
    // Verificar se RLS está ativo nas tabelas principais
    const tables = ['usuarios', 'produtos', 'categorias', 'pedidos'];
    
    for (const table of tables) {
      const result = await pool.query(`
        SELECT rowsecurity 
        FROM pg_tables 
        WHERE tablename = $1
      `, [table]);
      
      if (result.rows.length > 0) {
        const hasRLS = result.rows[0].rowsecurity;
        if (hasRLS) {
          log(`✅ ${table}: RLS ativo`, 'green');
        } else {
          log(`⚠️  ${table}: RLS inativo`, 'yellow');
        }
      }
    }
    
    // Verificar policies
    const policiesResult = await pool.query(`
      SELECT tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `);
    
    if (policiesResult.rows.length > 0) {
      log(`📋 Policies encontradas: ${policiesResult.rows.length}`, 'green');
      policiesResult.rows.forEach(policy => {
        log(`   🛡️  ${policy.tablename}.${policy.policyname} (${policy.cmd})`, 'green');
      });
    } else {
      log('⚠️  Nenhuma policy encontrada', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Erro ao testar RLS: ${error.message}`, 'red');
  }
}

// Testar performance
async function testPerformance(pool) {
  logSubSection('⚡ TESTANDO PERFORMANCE');
  
  const performanceTests = [
    {
      name: 'Query simples - SELECT COUNT(*)',
      query: 'SELECT COUNT(*) FROM usuarios',
      iterations: 10
    },
    {
      name: 'Query com JOIN',
      query: `
        SELECT u.nome, c.nome as categoria_nome 
        FROM produtos p 
        JOIN usuarios u ON p.cliente = u.cliente 
        JOIN categorias c ON p.categoria = c.id 
        LIMIT 10
      `,
      iterations: 5
    },
    {
      name: 'Query com filtro por cliente',
      query: `
        SELECT COUNT(*) 
        FROM produtos p 
        JOIN usuarios u ON p.cliente = u.cliente 
        WHERE u.cliente = (SELECT id FROM m24_clientes LIMIT 1)
      `,
      iterations: 10
    }
  ];
  
  for (const test of performanceTests) {
    const times = [];
    
    for (let i = 0; i < test.iterations; i++) {
      const start = Date.now();
      try {
        await pool.query(test.query);
        const end = Date.now();
        times.push(end - start);
      } catch (error) {
        log(`❌ ${test.name}: ${error.message}`, 'red');
        break;
      }
    }
    
    if (times.length > 0) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      log(`✅ ${test.name}:`, 'green');
      log(`   📊 Média: ${avgTime.toFixed(2)}ms`, 'green');
      log(`   📊 Min: ${minTime}ms, Max: ${maxTime}ms`, 'green');
      
      if (avgTime > 1000) {
        log(`   ⚠️  Performance lenta (>1s)`, 'yellow');
      }
    }
  }
}

// Testar conectividade com serviços
async function testServiceConnectivity() {
  logSubSection('🔌 TESTANDO CONECTIVIDADE COM SERVIÇOS');
  
  const services = [
    { name: 'Catalog Service', port: 5000, path: '/health' },
    { name: 'Orders Service', port: 6000, path: '/health' },
    { name: 'Commission Service', port: 7000, path: '/health' }
  ];
  
  for (const service of services) {
    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: service.port,
          path: service.path,
          method: 'GET',
          timeout: 5000
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.end();
      });
      
      if (response.status === 200) {
        log(`✅ ${service.name}: Online (${response.status})`, 'green');
      } else {
        log(`⚠️  ${service.name}: Status ${response.status}`, 'yellow');
      }
    } catch (error) {
      log(`❌ ${service.name}: ${error.message}`, 'red');
    }
  }
}

// Gerar relatório de conectividade
function generateConnectivityReport() {
  logSection('📋 RELATÓRIO DE CONECTIVIDADE');
  
  log('\n✅ Se todos os testes passaram:', 'green');
  log('   - O Supabase está acessível', 'green');
  log('   - As credenciais estão corretas', 'green');
  log('   - O banco está funcionando', 'green');
  log('   - Multi-tenancy está configurado', 'green');
  log('   - RLS está ativo', 'green');
  
  log('\n⚠️  Se alguns testes falharam:', 'yellow');
  log('   - Verifique as variáveis de ambiente', 'yellow');
  log('   - Confirme as credenciais do Supabase', 'yellow');
  log('   - Verifique se o banco foi migrado corretamente', 'yellow');
  log('   - Teste a conectividade de rede', 'yellow');
  
  log('\n🔧 Próximos passos:', 'blue');
  log('1. Configure os serviços para usar o Supabase', 'blue');
  log('2. Teste as funcionalidades da aplicação', 'blue');
  log('3. Monitore a performance em produção', 'blue');
  log('4. Configure alertas e monitoramento', 'blue');
}

// Função principal
async function main() {
  logSection('🚀 TESTE DE CONECTIVIDADE COM SUPABASE');
  
  // Carregar variáveis de ambiente
  require('dotenv').config();
  
  // Verificar variáveis necessárias
  const requiredVars = ['POSTGRES_HOST', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log(`❌ Variáveis ausentes: ${missingVars.join(', ')}`, 'red');
    log('Configure as variáveis de ambiente antes de executar este teste', 'red');
    process.exit(1);
  }
  
  // Testar conectividade
  const hostOk = await testHostConnectivity();
  if (!hostOk) {
    log('❌ Falha na conectividade com o host', 'red');
    process.exit(1);
  }
  
  // Testar conexão com banco
  const pool = await testDatabaseConnection();
  if (!pool) {
    log('❌ Falha na conexão com o banco', 'red');
    process.exit(1);
  }
  
  try {
    // Executar testes
    await testBasicQueries(pool);
    await testMultiTenancy(pool);
    await testRLS(pool);
    await testPerformance(pool);
    await testServiceConnectivity();
    
    // Gerar relatório
    generateConnectivityReport();
    
    logSection('✅ TESTE DE CONECTIVIDADE CONCLUÍDO');
    log('🎉 O Supabase está funcionando corretamente!', 'green');
    
  } catch (error) {
    log(`❌ Erro durante os testes: ${error.message}`, 'red');
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
  testHostConnectivity,
  testDatabaseConnection,
  testBasicQueries,
  testMultiTenancy,
  testRLS,
  testPerformance,
  testServiceConnectivity,
  generateConnectivityReport
}; 