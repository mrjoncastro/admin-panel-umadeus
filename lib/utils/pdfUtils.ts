import type { Inscricao, Pedido, Produto } from '@/types'

// Constantes para PDF
export const PDF_CONSTANTS = {
  MARGIN: 20,
  FONT_SIZES: {
    TITLE: 24,
    SUBTITLE: 18,
    HEADER: 14,
    TABLE_HEADER: 8,
    TABLE_DATA: 6,
    FOOTER: 9,
  },
  COLORS: {
    PRIMARY: [220, 38, 38],    // Vermelho principal
    SECONDARY: [239, 68, 68],  // Vermelho mais claro
    BLUE: [59, 130, 246],      // Azul
    GREEN: [34, 197, 94],      // Verde
    YELLOW: [234, 179, 8],     // Amarelo
    PURPLE: [168, 85, 247],    // Roxo
    PINK: [236, 72, 153],      // Rosa
    LIGHT_BLUE: [14, 165, 233], // Azul claro
    // Cores para tabelas
    HEADER_BG: [240, 240, 240], // Cinza claro para cabeçalhos
    ROW_ALT_BG: [242, 242, 242], // Cinza mais claro para zebra striping
    BORDER: [200, 200, 200],   // Cor da borda das tabelas
  },
  SPACING: {
    LINE_HEIGHT: 8,
    TABLE_ROW_HEIGHT: 8,
    CHART_BAR_HEIGHT: 10,
    CHART_BAR_SPACING: 15,
  },
  DIMENSIONS: {
    HEADER_HEIGHT: 12,
    ROW_HEIGHT: 8,
    CELL_PADDING: 4,
  }
}

// Função para formatar CPF
export function formatCpf(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

// Função para calcular status das inscrições
export function calculateInscricoesStatus(inscricoes: Inscricao[]) {
  return inscricoes.reduce((acc, inscricao) => {
    const status = inscricao.status || 'pendente'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

// Função para calcular status dos pedidos
export function calculatePedidosStatus(pedidos: Pedido[]) {
  return pedidos.reduce((acc, pedido) => {
    const status = pedido.status || 'pendente'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

// Função para calcular resumo por tamanho
export function calculateResumoPorTamanho(pedidos: Pedido[], produtos: Produto[]) {
  return pedidos.reduce((acc, pedido) => {
    const tamanho = pedido.tamanho || 'Sem tamanho'
    if (!acc[tamanho]) {
      acc[tamanho] = {
        quantidade: 0,
        produtos: new Set()
      }
    }
    acc[tamanho].quantidade += 1
    
    if (Array.isArray(pedido.produto)) {
      pedido.produto.forEach(prodId => {
        const produto = produtos.find(p => p.id === prodId)
        if (produto) {
          acc[tamanho].produtos.add(produto.nome)
        }
      })
    }
    return acc
  }, {} as Record<string, { quantidade: number; produtos: Set<string> }>)
}

// Função para calcular resumo por campo
export function calculateResumoPorCampo(inscricoes: Inscricao[]) {
  return inscricoes.reduce((acc, inscricao) => {
    const campo = inscricao.campo || 'Sem campo'
    if (!acc[campo]) {
      acc[campo] = 0
    }
    acc[campo] += 1
    return acc
  }, {} as Record<string, number>)
}

// Função para obter nome do cliente
export function getNomeCliente(pedido: Pedido): string {
  if (pedido.canal === 'loja') {
    return pedido.expand?.responsavel?.nome || ''
  } else {
    return pedido.expand?.id_inscricao?.nome || ''
  }
}

// Função para obter informações do produto
export function getProdutoInfo(produtoId: string, produtos: Produto[]): string {
  const produto = produtos.find(p => p.id === produtoId)
  return produto ? produto.nome : 'N/A'
}

// Função para obter nome do evento
export function getEventoNome(produtoId: string, produtos: Produto[]): string {
  const produto = produtos.find(p => p.id === produtoId)
  return produto?.expand?.evento?.titulo || 'N/A'
}

// Função para obter CPF do cliente
export function getCpfCliente(pedido: Pedido): string {
  // Se o pedido tem canal 'loja', buscar CPF do responsável
  if (pedido.canal === 'loja') {
    // O responsável não tem CPF diretamente, mas podemos buscar através do id_inscricao
    return pedido.expand?.id_inscricao?.cpf || 'N/A'
  }
  
  // Se o pedido tem canal 'inscricao', buscar CPF da inscrição
  if (pedido.canal === 'inscricao') {
    return pedido.expand?.id_inscricao?.cpf || 'N/A'
  }
  
  // Fallback: tentar buscar CPF da inscrição associada
  return pedido.expand?.id_inscricao?.cpf || 'N/A'
}

// Função para normalizar datas de forma segura
export function normalizeDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Não informado'

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return 'Data inválida'
  }
}

// Total de produtos por canal
export function calculateProdutosPorCanal(pedidos: Pedido[]) {
  return pedidos.reduce((acc, pedido) => {
    const canal = pedido.canal || 'outros'
    const quantidade = Array.isArray(pedido.produto) ? pedido.produto.length : 1
    acc[canal] = (acc[canal] || 0) + quantidade
    return acc
  }, {} as Record<string, number>)
}

// Tabela cruzada Produto x Tamanho
export function calculateProdutoTamanhoCross(
  pedidos: Pedido[],
  produtos: Produto[],
) {
  return pedidos.reduce((acc, pedido) => {
    const tamanho = pedido.tamanho || 'Sem tamanho'
    const ids = Array.isArray(pedido.produto) ? pedido.produto : [pedido.produto]
    ids.forEach(id => {
      const nome = produtos.find(p => p.id === id)?.nome || 'N/A'
      acc[nome] = acc[nome] || {}
      acc[nome][tamanho] = (acc[nome][tamanho] || 0) + 1
    })
    return acc
  }, {} as Record<string, Record<string, number>>)
}