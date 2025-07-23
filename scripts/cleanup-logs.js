#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Arquivos e pastas a ignorar
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  '.git',
  'scripts/cleanup-logs.js', // Não processar a si mesmo
  '__tests__',
  '.storybook'
];

// Padrões de console.log que devem ser substituídos
const LOG_PATTERNS = [
  {
    // console.log com dados sensíveis
    pattern: /console\.log\([^)]*(?:password|token|key|secret|credential|auth)[^)]*\)/gi,
    replacement: '// [REMOVED] Sensitive console.log'
  },
  {
    // console.log genérico em produção
    pattern: /console\.log\(/g,
    replacement: 'logger.debug('
  },
  {
    // console.error
    pattern: /console\.error\(/g,
    replacement: 'logger.error('
  },
  {
    // console.warn
    pattern: /console\.warn\(/g,
    replacement: 'logger.warn('
  },
  {
    // console.info
    pattern: /console\.info\(/g,
    replacement: 'logger.info('
  }
];

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function processFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js') && !filePath.endsWith('.jsx')) {
    return false;
  }

  if (shouldIgnore(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let hasLoggerImport = content.includes('import { logger }') || content.includes('from \'@/lib/logger\'');

  // Verificar se há console.log no arquivo
  const hasConsoleLogs = LOG_PATTERNS.some(pattern => pattern.pattern.test(content));

  if (hasConsoleLogs && !hasLoggerImport) {
    // Adicionar import do logger no topo do arquivo
    const importMatch = content.match(/^(import [^;]+;?\n?)*/m);
    if (importMatch) {
      const importSection = importMatch[0];
      const newImport = "import { logger } from '@/lib/logger'\n";
      content = content.replace(importSection, importSection + newImport);
      modified = true;
    }
  }

  // Aplicar substituições
  for (const { pattern, replacement } of LOG_PATTERNS) {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Processado: ${filePath}`);
    return true;
  }

  return false;
}

function walkDirectory(dir) {
  let processedCount = 0;
  
  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!shouldIgnore(entryPath)) {
          walk(entryPath);
        }
      } else if (entry.isFile()) {
        if (processFile(entryPath)) {
          processedCount++;
        }
      }
    }
  }

  walk(dir);
  return processedCount;
}

function main() {
  console.log('🧹 Iniciando limpeza de logs sensíveis...\n');

  const servicesPaths = [
    'services/gateway',
    'services/auth',
    'services/catalog',
    'services/orders',
    'services/commission'
  ];

  let totalProcessed = 0;

  for (const servicePath of servicesPaths) {
    if (fs.existsSync(servicePath)) {
      console.log(`📁 Processando ${servicePath}...`);
      const count = walkDirectory(servicePath);
      totalProcessed += count;
      console.log(`   ${count} arquivos modificados\n`);
    }
  }

  console.log(`✨ Limpeza concluída! ${totalProcessed} arquivos processados.`);
  
  if (totalProcessed > 0) {
    console.log('\n⚠️  IMPORTANTE:');
    console.log('1. Verifique os arquivos modificados');
    console.log('2. Teste se a aplicação ainda funciona');
    console.log('3. Ajuste imports do logger conforme necessário');
  }
}

if (require.main === module) {
  main();
}