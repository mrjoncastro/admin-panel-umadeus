import { promises as fs } from 'fs'
import path from 'path'

interface TemplateData {
  [key: string]: string
}

/**
 * Renderiza um template HTML substituindo placeholders
 * @param templateName Nome do arquivo template (sem extensão)
 * @param data Dados para substituir os placeholders
 * @returns HTML renderizado
 */
export async function renderTemplate(
  templateName: string,
  data: TemplateData
): Promise<string> {
  try {
    const templatePath = path.join(
      process.cwd(),
      'lib',
      'templates',
      `${templateName}.html`
    )
    
    let html = await fs.readFile(templatePath, 'utf8')
    
    // Substitui todos os placeholders {{key}} pelos valores
    for (const [key, value] of Object.entries(data)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g')
      html = html.replace(placeholder, value)
    }
    
    return html
  } catch (error) {
    console.error(`Erro ao renderizar template ${templateName}:`, error)
    throw new Error(`Template ${templateName} não encontrado ou inválido`)
  }
}

/**
 * Gera cor mais escura para hover states
 * @param hexColor Cor em formato hex (#RRGGBB)
 * @returns Cor mais escura
 */
export function darkenColor(hexColor: string): string {
  // Remove # se presente
  const hex = hexColor.replace('#', '')
  
  // Converte para RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Escurece em 20%
  const factor = 0.8
  const darkR = Math.round(r * factor)
  const darkG = Math.round(g * factor)
  const darkB = Math.round(b * factor)
  
  // Converte de volta para hex
  return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`
} 