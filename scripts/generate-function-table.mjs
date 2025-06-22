import fs from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGET_DIRS = ['app', 'lib', 'components'];

async function walk(dir) {
  const dirPath = path.join(ROOT, dir);
  let entries;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.(tsx?|ts)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      files.push(full);
    }
  }
  return files;
}

function getNamedExports(file) {
  const fullPath = path.join(ROOT, file);
  const content = readFileSync(fullPath, 'utf8');
  const names = new Set();
  const fnRegex = /^export\s+(?:async\s+)?function\s+(\w+)/gm;
  const defaultFnRegex = /^export\s+default\s+function\s+(\w+)/gm;
  const constRegex = /^export\s+(?:const|let|var)\s+(\w+)/gm;
  const namedRegex = /^export\s+{([^}]+)}/gm;
  let match;
  while ((match = fnRegex.exec(content))) {
    names.add(match[1]);
  }
  while ((match = defaultFnRegex.exec(content))) {
    names.add(match[1]);
  }
  while ((match = constRegex.exec(content))) {
    names.add(match[1]);
  }
  while ((match = namedRegex.exec(content))) {
    match[1]
      .split(',')
      .map((n) => n.trim().replace(/\sas.*$/, ''))
      .forEach((n) => names.add(n));
  }
  return Array.from(names);
}

function detectRoute(file) {
  if (!file.startsWith('app/')) return '';
  const relative = file.slice('app/'.length);
  if (relative.endsWith('/page.tsx')) {
    const dir = path.dirname(relative);
    return '/' + dir.replace(/\\index$/, '').replace(/\\page$/, '');
  }
  if (relative.endsWith('/route.ts')) {
    const dir = path.dirname(relative);
    return '/' + dir.replace(/\\index$/, '');
  }
  if (relative.endsWith('/layout.tsx')) {
    const dir = path.dirname(relative);
    return '/' + dir.replace(/\\index$/, '');
  }
  return '';
}

function formatSegments(segments) {
  return segments
    .map((s) => s.replace(/[\[\]]/g, '').replace(/-/g, ' '))
    .join('/');
}

function detectObjective(file, exports) {
  if (file.includes('/api/') && file.endsWith('/route.ts')) {
    const relative = file.replace(/^app\//, '').replace(/\/route.ts$/, '');
    const parts = relative.split('/');
    const isAdmin = parts[0] === 'admin';
    const apiIndex = parts.indexOf('api');
    const routeParts = parts.slice(apiIndex + 1);
    const segmentStr = formatSegments(routeParts);
    const methods = exports
      .filter((n) => /^(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)$/i.test(n))
      .join(', ');
    const methodStr = methods ? ` (${methods})` : '';
    return `Endpoint ${isAdmin ? 'admin ' : ''}para ${segmentStr}${methodStr}`;
  }
  if (file.startsWith('app/') && file.endsWith('/page.tsx')) {
    const relative = file.replace(/^app\//, '').replace(/\/page.tsx$/, '');
    const segmentStr = formatSegments(relative.split('/'));
    return `Página ${segmentStr}`;
  }
  if (file.includes('templates/')) {
    const name = path.basename(file, path.extname(file));
    return `Template/Layout ${name}`;
  }
  if (file.includes('components/')) {
    const name = path.basename(file, path.extname(file));
    return `Componente UI ${name}`;
  }
  if (file.startsWith('lib/')) {
    const name = path.basename(file);
    return `Funções utilitárias (${name})`;
  }
  return 'Código auxiliar';
}

async function main() {
  const index = {};
  for (const dir of TARGET_DIRS) {
    const files = await walk(dir);
    for (const file of files) {
      const exports = getNamedExports(file);
      if (exports.length) index[file] = exports;
    }
  }
  const lines = ['| Arquivo | Função / Export | Rota | Objetivo |', '| ------- | --------------- | ---- | -------- |'];
  const entries = Object.keys(index).sort();
  for (const file of entries) {
    const exps = index[file].join(', ');
    const route = detectRoute(file);
    const objective = detectObjective(file, index[file]);
    lines.push(`| ${file} | ${exps} | ${route} | ${objective} |`);
  }
  await fs.writeFile(path.join(ROOT, 'docs', 'function-index-table.md'), lines.join('\n'));
  console.log('✅ docs/function-index-table.md atualizado');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
