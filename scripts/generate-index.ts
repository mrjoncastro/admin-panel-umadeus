import fs from 'node:fs/promises'
import { Dirent, readFileSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const ROOT = process.cwd()
const TARGET_DIRS = ['app', 'lib', 'components']

async function walk(dir: string): Promise<string[]> {
  const dirPath = path.join(ROOT, dir)
  let entries: Dirent[] = []
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true })
  } catch {
    return []
  }
  const files: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else if (/\.(tsx?|ts)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      files.push(full)
    }
  }
  return files
}

function isExport(modifiers?: readonly ts.ModifierLike[]): boolean {
  return Boolean(modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword))
}

function getNamedExports(file: string): string[] {
  const fullPath = path.join(ROOT, file)
  const content = readFileSync(fullPath, 'utf8')
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true)
  const names = new Set<string>()
  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && isExport(node.modifiers) && node.name) {
      names.add(node.name.text)
    } else if (ts.isVariableStatement(node) && isExport(node.modifiers)) {
      node.declarationList.declarations.forEach((d) => {
        if (ts.isIdentifier(d.name)) names.add(d.name.text)
      })
    } else if (
      ts.isExportDeclaration(node) &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause)
    ) {
      node.exportClause.elements.forEach((el) => names.add(el.name.text))
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return Array.from(names)
}

async function main() {
  const index: Record<string, string[]> = {}
  for (const dir of TARGET_DIRS) {
    const files = await walk(dir)
    for (const file of files) {
      const exports = getNamedExports(file)
      if (exports.length) index[file] = exports
    }
  }

  const lines: string[] = ['# \u00cdndice de Fun\u00e7\u00f5es e Componentes', '']
  for (const file of Object.keys(index).sort()) {
    lines.push(`- **${file}**`)
    for (const name of index[file]) {
      lines.push(`  - ${name}`)
    }
  }

  await fs.mkdir(path.join(ROOT, 'docs'), { recursive: true })
  await fs.writeFile(path.join(ROOT, 'docs', 'function-index.md'), lines.join('\n'))
  console.log('\u2705 docs/function-index.md gerado')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

