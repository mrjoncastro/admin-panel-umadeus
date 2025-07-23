#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let issues = [];
let warnings = [];
let passed = [];

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function checkFile(filePath, pattern, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (pattern.test(content)) {
      return true;
    }
  } catch (error) {
    // Arquivo não existe ou erro de leitura
  }
  return false;
}

function scanDirectory(dir, pattern, description) {
  const results = [];
  
  function walk(currentPath) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory() && !shouldIgnoreDir(entry.name)) {
          walk(entryPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          if (checkFile(entryPath, pattern, description)) {
            results.push(entryPath);
          }
        }
      }
    } catch (error) {
      // Diretório não existe ou erro de acesso
    }
  }

  if (fs.existsSync(dir)) {
    walk(dir);
  }
  return results;
}

function shouldIgnoreDir(dirName) {
  return ['node_modules', '.next', 'dist', '.git', '__tests__'].includes(dirName);
}

function main() {
  log('🔍 Verificação de Segurança - M24 Monorepo\n', BLUE);

  // 1. Verificar se PocketBase foi removido (ignorar comentários)
  log('1. Verificando remoção do PocketBase...', BLUE);
  const pocketbaseRefs = [
    ...scanDirectory('services/gateway', /^(?!.*\/\/).*(?:pocketbase|PocketBase)/im, 'Active PocketBase reference'),
    ...scanDirectory('services/auth', /^(?!.*\/\/).*(?:pocketbase|PocketBase)/im, 'Active PocketBase reference'),
    ...scanDirectory('services/catalog', /^(?!.*\/\/).*(?:pocketbase|PocketBase)/im, 'Active PocketBase reference')
  ];

  if (pocketbaseRefs.length === 0) {
    passed.push('✅ PocketBase completamente removido');
  } else {
    issues.push(`❌ Ainda existem ${pocketbaseRefs.length} referências ao PocketBase`);
    pocketbaseRefs.slice(0, 5).forEach(ref => {
      log(`   ${ref}`, RED);
    });
  }

  // 2. Verificar senhas em texto plano
  log('\n2. Verificando senhas em texto plano...', BLUE);
  const plaintextPasswords = scanDirectory('services', /\.eq\(['"]*password['"]*, *password\)/, 'Plaintext password comparison');
  
  if (plaintextPasswords.length === 0) {
    passed.push('✅ Nenhuma comparação de senha em texto plano encontrada');
  } else {
    issues.push(`❌ Encontradas ${plaintextPasswords.length} comparações de senha em texto plano`);
  }

  // 3. Verificar console.logs sensíveis
  log('\n3. Verificando logs sensíveis...', BLUE);
  const sensitiveConsoleeLogs = scanDirectory('services', /console\.log\([^)]*(?:password|token|key|secret|credential|auth)[^)]*\)/i, 'Sensitive console.log');
  
  if (sensitiveConsoleeLogs.length === 0) {
    passed.push('✅ Nenhum console.log sensível encontrado');
  } else {
    issues.push(`❌ Encontrados ${sensitiveConsoleeLogs.length} console.logs sensíveis`);
  }

  // 4. Verificar estrutura de arquivos
  log('\n4. Verificando estrutura de arquivos...', BLUE);
  
  const requiredFiles = [
    'services/gateway/lib/supabaseAdmin.ts',
    'services/gateway/lib/logger.ts',
    '.github/workflows/ci.yml',
    'scripts/cleanup-logs.js'
  ];

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      passed.push(`✅ ${file} existe`);
    } else {
      issues.push(`❌ ${file} não encontrado`);
    }
  });

  // 5. Verificar se serviço PocketBase foi removido
  log('\n5. Verificando remoção do serviço PocketBase...', BLUE);
  if (!fs.existsSync('services/pocketbase')) {
    passed.push('✅ Serviço PocketBase removido');
  } else {
    issues.push('❌ Diretório services/pocketbase ainda existe');
  }

  // 6. Verificar dependências
  log('\n6. Verificando dependências...', BLUE);
  try {
    const packageJson = JSON.parse(fs.readFileSync('services/gateway/package.json', 'utf8'));
    if (!packageJson.dependencies.pocketbase) {
      passed.push('✅ Dependência PocketBase removida do gateway');
    } else {
      issues.push('❌ Dependência PocketBase ainda presente no gateway');
    }

    const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (rootPackageJson.devDependencies.husky && !rootPackageJson.devDependencies.husk) {
      passed.push('✅ Dependência "husk" corrigida para "husky"');
    } else {
      issues.push('❌ Dependência "husk" não foi corrigida');
    }
  } catch (error) {
    warnings.push('⚠️ Erro ao verificar package.json');
  }

  // 7. Verificar variáveis de ambiente
  log('\n7. Verificando variáveis de ambiente...', BLUE);
  const envFiles = ['env.example', 'services/gateway/env.example'];
  let pbVarsFound = false;

  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      if (content.includes('PB_URL') || content.includes('PB_ADMIN')) {
        pbVarsFound = true;
      }
    }
  });

  if (!pbVarsFound) {
    passed.push('✅ Variáveis PocketBase removidas dos arquivos .env');
  } else {
    issues.push('❌ Ainda existem variáveis PocketBase nos arquivos .env');
  }

  // Relatório final
  log('\n' + '='.repeat(50), BLUE);
  log('📊 RELATÓRIO FINAL', BLUE);
  log('='.repeat(50), BLUE);

  if (passed.length > 0) {
    log(`\n✅ PASSOU (${passed.length}):`, GREEN);
    passed.forEach(item => log(`   ${item}`, GREEN));
  }

  if (warnings.length > 0) {
    log(`\n⚠️  AVISOS (${warnings.length}):`, YELLOW);
    warnings.forEach(item => log(`   ${item}`, YELLOW));
  }

  if (issues.length > 0) {
    log(`\n❌ PROBLEMAS (${issues.length}):`, RED);
    issues.forEach(item => log(`   ${item}`, RED));
  }

  log('\n' + '='.repeat(50), BLUE);
  
  if (issues.length === 0) {
    log('🎉 PARABÉNS! Todas as verificações de segurança passaram!', GREEN);
    log('\n📋 Próximos passos recomendados:', BLUE);
    log('1. Execute os testes: pnpm test', BLUE);
    log('2. Faça build de produção: pnpm build', BLUE);
    log('3. Revise as mudanças no git', BLUE);
    log('4. Configure Supabase RLS policies', BLUE);
    process.exit(0);
  } else {
    log(`💥 ${issues.length} problema(s) de segurança encontrado(s)!`, RED);
    log('Por favor, corrija os problemas antes de prosseguir.', RED);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}