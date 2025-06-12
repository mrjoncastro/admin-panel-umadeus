import namer from 'color-namer'

const ptMap: Record<string, string> = {
  red: 'vermelho',
  green: 'verde',
  blue: 'azul',
  yellow: 'amarelo',
  orange: 'laranja',
  purple: 'roxo',
  violet: 'violeta',
  pink: 'rosa',
  brown: 'marrom',
  black: 'preto',
  white: 'branco',
  gray: 'cinza',
  grey: 'cinza',
  cyan: 'ciano',
  magenta: 'magenta',
  gold: 'dourado',
  silver: 'prata'
}

export function hexToPtName(hex: string): string {
  if (!hex) return ''
  try {
    const basic = namer(hex).basic[0]
    if (!basic) return hex
    const base = basic.name.toLowerCase().split(' ')[0]
    return ptMap[base] || basic.name
  } catch {
    return hex
  }
}
