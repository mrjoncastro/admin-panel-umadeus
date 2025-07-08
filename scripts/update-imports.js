const fs = require('fs');
const path = require('path');

// Mapeamento de imports relativos para aliases
const importMappings = [
  // Utils
  { from: "from '../utils/", to: "from '@utils/" },
  { from: "from '../../utils/", to: "from '@utils/" },
  { from: "from '../../../utils/", to: "from '@utils/" },
  
  // Types
  { from: "from '../types/", to: "from '@types/" },
  { from: "from '../../types/", to: "from '@types/" },
  { from: "from '../../../types/", to: "from '@types/" },
  
  // Design tokens
  { from: "from '../design-tokens/", to: "from '@design-tokens/" },
  { from: "from '../../design-tokens/", to: "from '@design-tokens/" },
  { from: "from '../../../design-tokens/", to: "from '@design-tokens/" },
];

function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    importMappings.forEach(mapping => {
      if (content.includes(mapping.from)) {
        content = content.replace(new RegExp(mapping.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), mapping.to);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      updateImportsInFile(filePath);
    }
  });
}

// Processar arquivos do gateway
const gatewayPath = path.join(__dirname, '../services/gateway');
console.log('🔄 Updating imports in gateway...');
processDirectory(gatewayPath);
console.log('✅ Import updates completed!'); 