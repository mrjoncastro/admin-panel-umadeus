#!/usr/bin/env node

/**
 * Script para executar a criação das policies
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

// Carregar variáveis de ambiente
require('dotenv').config();

async function executePolicies() {
  logSection('🛡️  CRIANDO POLICIES DE SEGURANÇA');
  
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
    log('✅ Conectado ao Supabase', 'green');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'criar-policies.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && cmd.includes('CREATE POLICY'));
    
    log(`📝 Executando ${commands.length} policies...`, 'blue');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        await client.query(command);
        successCount++;
        
        // Log de progresso a cada 5 comandos
        if (successCount % 5 === 0) {
          log(`✅ ${successCount}/${commands.length} policies criadas`, 'green');
        }
      } catch (error) {
        errorCount++;
        log(`❌ Erro na policy ${i + 1}: ${error.message}`, 'red');
        
        // Continuar mesmo com erros (algumas policies podem falhar se já existirem)
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          log(`   ⚠️  Policy já existe`, 'yellow');
        }
      }
    }
    
    logSection('📊 RESUMO DA CRIAÇÃO DE POLICIES');
    log(`✅ Policies criadas com sucesso: ${successCount}`, 'green');
    log(`❌ Policies com erro: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
    
    if (errorCount === 0) {
      log('\n🎉 Todas as policies foram criadas com sucesso!', 'green');
    } else {
      log('\n⚠️  Algumas policies falharam, mas a maioria foi criada', 'yellow');
    }
    
    // Verificar policies criadas
    log('\n🔍 Verificando policies criadas...', 'blue');
    
    try {
      const policiesResult = await client.query(`
        SELECT tablename, policyname, cmd
        FROM pg_policies 
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
      `);
      
      const policyCount = policiesResult.rows.length;
      log(`📋 Total de policies criadas: ${policyCount}`, 'green');
      
      // Agrupar por tabela
      const policiesByTable = {};
      policiesResult.rows.forEach(row => {
        if (!policiesByTable[row.tablename]) {
          policiesByTable[row.tablename] = [];
        }
        policiesByTable[row.tablename].push({
          name: row.policyname,
          cmd: row.cmd
        });
      });
      
      // Mostrar policies por tabela
      Object.keys(policiesByTable).forEach(table => {
        log(`\n📋 ${table}:`, 'blue');
        policiesByTable[table].forEach(policy => {
          log(`   🛡️  ${policy.name} (${policy.cmd})`, 'green');
        });
      });
      
    } catch (error) {
      log(`❌ Erro ao verificar policies: ${error.message}`, 'red');
    }
    
    client.release();
    
  } catch (error) {
    log(`❌ Erro fatal: ${error.message}`, 'red');
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executePolicies().catch(error => {
    log(`❌ Erro fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { executePolicies }; 