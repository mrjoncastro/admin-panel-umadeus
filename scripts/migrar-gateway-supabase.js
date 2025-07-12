#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuração
const GATEWAY_DIR = path.join(__dirname, '../services/gateway');
const MIGRATION_LOG = path.join(__dirname, 'migration-log.md');

// Arquivos que precisam ser migrados (prioridade)
const PRIORITY_FILES = [
  'lib/pocketbase.ts',
  'lib/pbWithAuth.ts',
  'lib/apiAuth.ts',
  'components/templates/HeaderAdmin.tsx',
  'components/templates/CreateUserForm.tsx',
  'components/organisms/EventForm.tsx',
  'components/onboarding/StepComplete.tsx',
  'components/onboarding/StepCreateInstance.tsx',
  'components/ConfirmResetForm.tsx',
  'lib/context/TenantContext.tsx',
  'lib/context/AuthContext.tsx',
  'components/admin/OnboardingWizard.tsx',
  'components/admin/ModalProdutoForm.tsx',
  'app/loja/perfil/page.tsx',
  'app/loja/produtos/page.tsx',
  'app/loja/checkout/page.tsx',
  'app/loja/categorias/page.tsx',
  'app/loja/categorias/[slug]/page.tsx',
  'app/completar-cadastro/page.tsx',
  'app/inscricoes/lider/[liderId]/page.tsx',
  'app/cliente/components/ProfileForm.tsx',
  'app/cliente/components/PedidosTable.tsx',
  'app/cliente/components/InscricoesTable.tsx',
  'app/cliente/components/DashboardHeader.tsx',
  'app/admin/perfil/page.tsx',
  'app/admin/produtos/editar/[id]/page.tsx',
  'app/admin/produtos/novo/ModalProduto.tsx',
  'app/admin/inscricoes/page.tsx'
];

// Função para log
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
  console.log(logEntry);
  
  // Salvar no arquivo de log
  fs.appendFileSync(MIGRATION_LOG, logEntry + '\n');
}

// Função para verificar se arquivo existe
function fileExists(filePath) {
  return fs.existsSync(path.join(GATEWAY_DIR, filePath));
}

// Função para contar referências ao PocketBase
function countPocketBaseReferences() {
  let count = 0;
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const pocketbaseMatches = content.match(/pocketbase/gi);
        if (pocketbaseMatches) {
          count += pocketbaseMatches.length;
          log(`Arquivo com referências: ${path.relative(GATEWAY_DIR, fullPath)} (${pocketbaseMatches.length} refs)`, 'warn');
        }
      }
    }
  }
  
  scanDirectory(GATEWAY_DIR);
  return count;
}

// Função para criar arquivo de migração
function createMigrationFile(filePath) {
  const relativePath = path.relative(GATEWAY_DIR, filePath);
  const migrationContent = `# Migração: ${relativePath}

## Status: Pendente

### Arquivo Original
\`\`\`typescript
// TODO: Substituir imports do PocketBase por Supabase
import createPocketBase from '@/lib/pocketbase'
// TODO: Substituir uso do PocketBase por Supabase
const pb = createPocketBase()
\`\`\`

### Migração Necessária
1. Substituir \`import createPocketBase from '@/lib/pocketbase'\` por \`import { supabase } from '@/lib/supabaseClient'\`
2. Substituir \`const pb = createPocketBase()\` por \`const { data, error } = await supabase.from('tabela').select()\`
3. Atualizar queries para usar sintaxe do Supabase
4. Atualizar autenticação para usar Supabase Auth
5. Testar funcionalidade

### Exemplo de Migração
\`\`\`typescript
// Antes (PocketBase)
import createPocketBase from '@/lib/pocketbase'
const pb = createPocketBase()
const records = await pb.collection('usuarios').getList()

// Depois (Supabase)
import { supabase } from '@/lib/supabaseClient'
const { data: records, error } = await supabase
  .from('usuarios')
  .select('*')
\`\`\`

---
`;

  const migrationDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }
  
  const migrationFile = path.join(migrationDir, `${relativePath.replace(/[\/\\]/g, '_')}.md`);
  fs.writeFileSync(migrationFile, migrationContent);
  
  return migrationFile;
}

// Função principal
function main() {
  log('=== INICIANDO ANÁLISE DE MIGRAÇÃO GATEWAY ===');
  
  // Verificar se o diretório existe
  if (!fs.existsSync(GATEWAY_DIR)) {
    log('Diretório do Gateway não encontrado!', 'error');
    process.exit(1);
  }
  
  // Contar referências ao PocketBase
  log('Contando referências ao PocketBase...');
  const totalRefs = countPocketBaseReferences();
  log(`Total de referências encontradas: ${totalRefs}`, 'info');
  
  // Verificar arquivos prioritários
  log('Verificando arquivos prioritários...');
  const existingPriorityFiles = [];
  
  for (const file of PRIORITY_FILES) {
    if (fileExists(file)) {
      existingPriorityFiles.push(file);
      log(`✅ ${file} - Existe`, 'info');
    } else {
      log(`❌ ${file} - Não encontrado`, 'warn');
    }
  }
  
  // Criar arquivos de migração
  log('Criando arquivos de migração...');
  const migrationFiles = [];
  
  for (const file of existingPriorityFiles) {
    const migrationFile = createMigrationFile(path.join(GATEWAY_DIR, file));
    migrationFiles.push(migrationFile);
    log(`📝 Criado: ${migrationFile}`, 'info');
  }
  
  // Gerar relatório
  const report = `# Relatório de Migração Gateway → Supabase

## Resumo
- **Total de referências ao PocketBase**: ${totalRefs}
- **Arquivos prioritários encontrados**: ${existingPriorityFiles.length}/${PRIORITY_FILES.length}
- **Arquivos de migração criados**: ${migrationFiles.length}

## Próximos Passos
1. Configurar variáveis de ambiente do Supabase
2. Migrar arquivos prioritários um por vez
3. Testar cada migração
4. Remover dependência do PocketBase
5. Atualizar testes

## Arquivos Prioritários
${existingPriorityFiles.map(file => `- [ ] ${file}`).join('\n')}

## Arquivos de Migração Criados
${migrationFiles.map(file => `- ${path.basename(file)}`).join('\n')}

---
Gerado em: ${new Date().toISOString()}
`;

  fs.writeFileSync(path.join(__dirname, 'relatorio-migracao.md'), report);
  log('Relatório gerado: relatorio-migracao.md', 'info');
  
  log('=== ANÁLISE CONCLUÍDA ===');
  log(`Execute: node scripts/migrar-gateway-supabase.js para ver detalhes`);
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, countPocketBaseReferences, createMigrationFile }; 