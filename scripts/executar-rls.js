#!/usr/bin/env node

/**
 * Script para executar a ativação do RLS e criação de policies
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

async function executeRLSSetup() {
  logSection('🔒 ATIVANDO ROW LEVEL SECURITY E POLICIES');
  
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
    const sqlPath = path.join(__dirname, 'ativar-rls-policies.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    log(`📝 Executando ${commands.length} comandos...`, 'blue');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        await client.query(command);
        successCount++;
        
        // Log de progresso a cada 10 comandos
        if (successCount % 10 === 0) {
          log(`✅ ${successCount}/${commands.length} comandos executados`, 'green');
        }
      } catch (error) {
        errorCount++;
        log(`❌ Erro no comando ${i + 1}: ${error.message}`, 'red');
        
        // Continuar mesmo com erros (alguns comandos podem falhar se já existirem)
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          log(`   ⚠️  Comando já executado anteriormente`, 'yellow');
        }
      }
    }
    
    logSection('📊 RESUMO DA EXECUÇÃO');
    log(`✅ Comandos executados com sucesso: ${successCount}`, 'green');
    log(`❌ Comandos com erro: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
    
    if (errorCount === 0) {
      log('\n🎉 RLS e policies ativados com sucesso!', 'green');
    } else {
      log('\n⚠️  Alguns comandos falharam, mas a maioria foi executada', 'yellow');
    }
    
    // Verificar se RLS está ativo
    log('\n🔍 Verificando status do RLS...', 'blue');
    
    const tables = ['usuarios', 'produtos', 'categorias', 'pedidos', 'inscricoes'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`
          SELECT rowsecurity 
          FROM pg_tables 
          WHERE tablename = $1
        `, [table]);
        
        if (result.rows.length > 0) {
          const hasRLS = result.rows[0].rowsecurity;
          if (hasRLS) {
            log(`✅ ${table}: RLS ativo`, 'green');
          } else {
            log(`❌ ${table}: RLS inativo`, 'red');
          }
        }
      } catch (error) {
        log(`❌ Erro ao verificar ${table}: ${error.message}`, 'red');
      }
    }
    
    // Verificar policies
    try {
      const policiesResult = await client.query(`
        SELECT COUNT(*) as policy_count
        FROM pg_policies 
        WHERE schemaname = 'public'
      `);
      
      const policyCount = parseInt(policiesResult.rows[0].policy_count);
      log(`📋 Total de policies criadas: ${policyCount}`, 'green');
      
    } catch (error) {
      log(`❌ Erro ao contar policies: ${error.message}`, 'red');
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
  executeRLSSetup().catch(error => {
    log(`❌ Erro fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { executeRLSSetup }; 