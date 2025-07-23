#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function shouldIgnoreDir(dirName) {
  return ['node_modules', '.next', 'dist', '.git', 'docs'].includes(dirName);
}

function processFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remover imports do PocketBase
  const oldContent = content;
  
  // Remover imports específicos
  content = content.replace(/import.*pocketbase.*\n/gi, '// [REMOVED] PocketBase import\n');
  content = content.replace(/import.*PocketBase.*\n/gi, '// [REMOVED] PocketBase import\n');
  content = content.replace(/import.*createPocketBase.*\n/gi, '// [REMOVED] PocketBase import\n');
  content = content.replace(/import.*getPocketBaseFromRequest.*\n/gi, '// [REMOVED] PocketBase import\n');
  content = content.replace(/import.*fetchUsuario.*pocketbase.*\n/gi, '// [REMOVED] PocketBase import\n');
  content = content.replace(/import.*ClientResponseError.*\n/gi, '// [REMOVED] PocketBase import\n');
  content = content.replace(/import.*RecordModel.*\n/gi, '// [REMOVED] PocketBase import\n');

  // Remover usos do PocketBase (comentar para não quebrar)
  content = content.replace(/const pb = createPocketBase\(\)/g, '// const pb = createPocketBase() // [REMOVED]');
  content = content.replace(/const pb = useMemo\(\(\) => createPocketBase\(\), \[\]\)/g, '// const pb = useMemo(() => createPocketBase(), []) // [REMOVED]');
  content = content.replace(/pb\./g, '// pb. // [REMOVED] ');
  content = content.replace(/PB_URL/g, '// PB_URL // [REMOVED]');
  content = content.replace(/PB_ADMIN_EMAIL/g, '// PB_ADMIN_EMAIL // [REMOVED]');
  content = content.replace(/PB_ADMIN_PASSWORD/g, '// PB_ADMIN_PASSWORD // [REMOVED]');

  // Comentar funções que usam PocketBase
  content = content.replace(/await pb\./g, '// await pb. // [REMOVED] ');
  content = content.replace(/pb\!/g, '// pb! // [REMOVED] ');

  if (content !== oldContent) {
    // Adicionar comentário no topo sobre migração
    const migrationComment = `// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase\n// TODO: Replace PocketBase functionality with Supabase equivalents\n\n`;
    
    if (!content.includes('[MIGRATION NOTE]')) {
      content = migrationComment + content;
    }

    fs.writeFileSync(filePath, content);
    console.log(`✅ Processado: ${filePath}`);
    return true;
  }

  return false;
}

function walkDirectory(dir) {
  let processedCount = 0;
  
  function walk(currentPath) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          if (!shouldIgnoreDir(entry.name)) {
            walk(entryPath);
          }
        } else if (entry.isFile()) {
          if (processFile(entryPath)) {
            processedCount++;
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
  return processedCount;
}

function main() {
  console.log('🗑️  Removendo referências ao PocketBase...\n');

  const servicesPaths = [
    'services/gateway'
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

  console.log(`✨ Remoção concluída! ${totalProcessed} arquivos processados.`);
  
  if (totalProcessed > 0) {
    console.log('\n⚠️  IMPORTANTE:');
    console.log('1. Arquivos foram comentados para não quebrar a aplicação');
    console.log('2. Busque por "[MIGRATION NOTE]" para ver arquivos que precisam ser migrados');
    console.log('3. Substitua a funcionalidade do PocketBase por Supabase equivalente');
    console.log('4. Teste a aplicação após as mudanças');
  }
}

if (require.main === module) {
  main();
}