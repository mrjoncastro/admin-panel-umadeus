import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Inscricao, Pedido, Produto } from '../../types'
import {
  getNomeCliente,
  getProdutoInfo,
  getEventoNome,
  formatCpf,
  getCpfCliente,
} from '@/lib/utils/pdfUtils'

export interface ExportData {
  inscricoes: Inscricao[]
  pedidos: Pedido[]
  produtos: Produto[]
  totalInscricoes: number
  totalPedidos: number
  valorTotal: number
}

export const exportToExcel = (data: ExportData, filename?: string) => {
  // Criar workbook
  const workbook = XLSX.utils.book_new()

  // Dados do resumo
  const resumoData = [
    ['Métrica', 'Valor'],
    ['Total de Inscrições', data.totalInscricoes],
    ['Total de Pedidos', data.totalPedidos],
    ['Valor Total (R$)', data.valorTotal.toFixed(2)],
  ]

  // Criar planilha do resumo
  const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData)
  XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo')

  const sortedInscricoes = [...data.inscricoes].sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR'),
  )

  const inscricoesData = [
    ['Nome', 'CPF', 'Evento', 'Campo', 'Produto', 'Status'],
    ...sortedInscricoes.map(inscricao => [
      inscricao.nome || 'Não informado',
      formatCpf(inscricao.cpf || inscricao.id),
      getEventoNome(inscricao.produto || '', data.produtos),
      inscricao.expand?.campo?.nome || inscricao.campo || 'Não informado',
      getProdutoInfo(inscricao.produto || '', data.produtos),
      inscricao.status || 'Não informado',
    ]),
  ]

  // Criar planilha das inscrições
  const inscricoesSheet = XLSX.utils.aoa_to_sheet(inscricoesData)
  XLSX.utils.book_append_sheet(workbook, inscricoesSheet, 'Inscrições')

  // Preparar dados dos pedidos
  const sortedPedidos = [...data.pedidos].sort((a, b) =>
    getNomeCliente(a).localeCompare(getNomeCliente(b), 'pt-BR'),
  )

  const pedidosData = [
    ['Nome', 'CPF', 'Campo', 'Produto', 'Tamanho', 'Canal', 'Status'],
    ...sortedPedidos.map(pedido => [
      getNomeCliente(pedido),
      formatCpf(getCpfCliente(pedido)),
      pedido.expand?.campo?.nome || pedido.campo || 'Não informado',
      pedido.produto
        .map(prodId => getProdutoInfo(prodId, data.produtos))
        .join(', '),
      pedido.tamanho || 'Não informado',
      pedido.canal || 'Não informado',
      pedido.status || 'Não informado',
    ]),
  ]

  // Criar planilha dos pedidos
  const pedidosSheet = XLSX.utils.aoa_to_sheet(pedidosData)
  XLSX.utils.book_append_sheet(workbook, pedidosSheet, 'Pedidos')

  // Estatísticas por campo
  const estatisticasCampo = data.inscricoes.reduce<
    Record<string, { inscricoes: number; pedidos: number; valor: number }>
  >((acc, inscricao) => {
    const campo = inscricao.expand?.campo?.nome || 'Sem campo'
    if (!acc[campo]) {
      acc[campo] = { inscricoes: 0, pedidos: 0, valor: 0 }
    }
    acc[campo].inscricoes++
    return acc
  }, {})

  // Adicionar dados dos pedidos às estatísticas
  data.pedidos.forEach((pedido) => {
    const campo = pedido.expand?.campo?.nome || 'Sem campo'
    if (!estatisticasCampo[campo]) {
      estatisticasCampo[campo] = { inscricoes: 0, pedidos: 0, valor: 0 }
    }
    estatisticasCampo[campo].pedidos++
    if (pedido.status === 'pago') {
      estatisticasCampo[campo].valor += Number(pedido.valor || 0)
    }
  })

  const estatisticasData = [
    ['Campo', 'Inscrições', 'Pedidos', 'Valor Total (R$)'],
    ...Object.entries(estatisticasCampo).map(([campo, stats]) => [
      campo,
      stats.inscricoes,
      stats.pedidos,
      stats.valor.toFixed(2),
    ]),
  ]

  // Criar planilha das estatísticas
  const estatisticasSheet = XLSX.utils.aoa_to_sheet(estatisticasData)
  XLSX.utils.book_append_sheet(workbook, estatisticasSheet, 'Estatísticas')

  // Gerar arquivo
  const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const finalFilename =
    filename || `relatorio_geral_${new Date().toISOString().split('T')[0]}.xlsx`
  saveAs(blob, finalFilename)
}

export const exportInscricoesToExcel = (
  inscricoes: Inscricao[],
  produtos: Produto[],
  filename?: string,
) => {
  const workbook = XLSX.utils.book_new()

  const sorted = [...inscricoes].sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR'),
  )

  const data = [
    ['Nome', 'CPF', 'Evento', 'Campo', 'Produto', 'Status'],
    ...sorted.map(inscricao => [
      inscricao.nome || 'Não informado',
      formatCpf(inscricao.cpf || inscricao.id),
      getEventoNome(inscricao.produto || '', produtos),
      inscricao.expand?.campo?.nome || inscricao.campo || 'Não informado',
      getProdutoInfo(inscricao.produto || '', produtos),
      inscricao.status || 'Não informado',
    ]),
  ]

  const sheet = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(workbook, sheet, 'Inscrições')

  const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const finalFilename =
    filename || `inscricoes_${new Date().toISOString().split('T')[0]}.xlsx`
  saveAs(blob, finalFilename)
}

export const exportPedidosToExcel = (
  pedidos: Pedido[],
  produtos: Produto[],
  filename?: string,
) => {
  const workbook = XLSX.utils.book_new()

  const sorted = [...pedidos].sort((a, b) =>
    getNomeCliente(a).localeCompare(getNomeCliente(b), 'pt-BR'),
  )

  const data = [
    ['Nome', 'CPF', 'Campo', 'Produto', 'Tamanho', 'Canal', 'Status'],
    ...sorted.map(pedido => [
      getNomeCliente(pedido),
      formatCpf(getCpfCliente(pedido)),
      pedido.expand?.campo?.nome || pedido.campo || 'Não informado',
      pedido.produto
        .map(prodId => getProdutoInfo(prodId, produtos))
        .join(', '),
      pedido.tamanho || 'Não informado',
      pedido.canal || 'Não informado',
      pedido.status || 'Não informado',
    ]),
  ]

  const sheet = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(workbook, sheet, 'Pedidos')

  const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const finalFilename =
    filename || `pedidos_${new Date().toISOString().split('T')[0]}.xlsx`
  saveAs(blob, finalFilename)
}

// Nova função que exporta com a mesma estrutura do PDF
export const exportToExcelLikePDF = (data: ExportData, filename?: string) => {
  const workbook = XLSX.utils.book_new()

  // Determinar o contexto
  const isRelatorios = window.location.pathname.includes('/relatorios')
  const urlParams = new URLSearchParams(window.location.search)
  const eventoFiltro = urlParams.get('evento')
  const eventoSelecionado = eventoFiltro && eventoFiltro !== 'todos' ? eventoFiltro : null

  // 1. VISÃO GERAL EXECUTIVA
  const visaoGeralData = [
    ['VISÃO GERAL EXECUTIVA'],
    [''],
    ['KPI Cards'],
    ['Inscrições', data.totalInscricoes],
    ['Pedidos', data.totalPedidos],
    ['Valor Total (R$)', data.valorTotal.toFixed(2)],
    [''],
    ['Status das Inscrições'],
    ['Status', 'Quantidade', 'Percentual'],
  ]

  // Adicionar dados de status das inscrições
  const statusInscricoes = data.inscricoes.reduce((acc, inscricao) => {
    const status = inscricao.status || 'Não informado'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  Object.entries(statusInscricoes).forEach(([status, count]) => {
    const percentual = ((count / data.totalInscricoes) * 100).toFixed(1)
    visaoGeralData.push([status, count, `${percentual}%`])
  })
  visaoGeralData.push(['Total', data.totalInscricoes, '100%'])

  visaoGeralData.push([''])
  visaoGeralData.push(['Status dos Pedidos'])
  visaoGeralData.push(['Status', 'Quantidade', 'Percentual'])

  // Adicionar dados de status dos pedidos
  const statusPedidos = data.pedidos.reduce((acc, pedido) => {
    const status = pedido.status || 'Não informado'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  Object.entries(statusPedidos).forEach(([status, count]) => {
    const percentual = ((count / data.totalPedidos) * 100).toFixed(1)
    visaoGeralData.push([status, count, `${percentual}%`])
  })
  visaoGeralData.push(['Total', data.totalPedidos, '100%'])

  visaoGeralData.push([''])
  visaoGeralData.push(['Totais por Produto'])
  visaoGeralData.push(['Campo', 'Produto', 'Status', 'Total', '% do Total'])

  // Calcular totais por produto (sem tamanho)
  const totaisPorProduto = new Map<string, [string, string, string, number, number]>()
  
  data.pedidos.forEach(pedido => {
    const campo = pedido.expand?.campo?.nome || 'N/A'
    const produtoId = Array.isArray(pedido.produto) ? pedido.produto[0] : pedido.produto
    const produto = getProdutoInfo(produtoId || '', data.produtos)
    const status = pedido.status || 'N/A'
    const key = `${campo}-${produto}-${status}`

    if (totaisPorProduto.has(key)) {
      const [, , , count] = totaisPorProduto.get(key)!
      totaisPorProduto.set(key, [campo, produto, status, count + 1, 0])
    } else {
      totaisPorProduto.set(key, [campo, produto, status, 1, 0])
    }
  })

  // Calcular percentuais e ordenar
  const total = data.pedidos.length
  const totaisOrdenados = Array.from(totaisPorProduto.values())
    .map(([campo, produto, status, count]) => [
      campo, produto, status, count, (count / total) * 100
    ])
    .sort((a, b) => {
      // Ordenar por: Campo → Produto → Status
      const campoA = (a[0] as string).toLowerCase().trim()
      const campoB = (b[0] as string).toLowerCase().trim()
      if (campoA !== campoB) {
        return campoA.localeCompare(campoB, 'pt-BR', { numeric: true })
      }

      const produtoA = (a[1] as string).toLowerCase().trim()
      const produtoB = (b[1] as string).toLowerCase().trim()
      if (produtoA !== produtoB) {
        return produtoA.localeCompare(produtoB, 'pt-BR', { numeric: true })
      }

      const statusA = (a[2] as string).toLowerCase().trim()
      const statusB = (b[2] as string).toLowerCase().trim()
      return statusA.localeCompare(statusB, 'pt-BR', { numeric: true })
    })

  totaisOrdenados.forEach(([campo, produto, status, count, percentage]) => {
    visaoGeralData.push([
      campo as string,
      produto as string,
      status as string,
      count as number,
      `${(percentage as number).toFixed(1)}%`
    ])
  })

  const visaoGeralSheet = XLSX.utils.aoa_to_sheet(visaoGeralData)
  XLSX.utils.book_append_sheet(workbook, visaoGeralSheet, 'Visão Geral Executiva')

  // 2. PRODUTOS X TAMANHOS
  const produtosTamanhosData = [
    ['PRODUTOS X TAMANHOS'],
    [''],
    ['Campo', 'Produto', 'Tamanho', 'Status', 'Total', '% do Total'],
  ]

  // Calcular dados analíticos de pedidos
  const analytics = new Map<string, [string, string, string, string, number, number]>()

  data.pedidos.forEach(pedido => {
    const campo = pedido.expand?.campo?.nome || 'N/A'
    const produtoId = Array.isArray(pedido.produto) ? pedido.produto[0] : pedido.produto
    const produto = getProdutoInfo(produtoId || '', data.produtos)
    const tamanho = pedido.tamanho || 'N/A'
    const status = pedido.status || 'N/A'
    const key = `${campo}-${produto}-${tamanho}-${status}`

    if (analytics.has(key)) {
      const [, , , , count] = analytics.get(key)!
      analytics.set(key, [campo, produto, tamanho, status, count + 1, 0])
    } else {
      analytics.set(key, [campo, produto, tamanho, status, 1, 0])
    }
  })

  // Calcular percentuais e ordenar
  const analyticsOrdenados = Array.from(analytics.values())
    .map(([campo, produto, tamanho, status, count]) => [
      campo, produto, tamanho, status, count, (count / total) * 100
    ])
    .sort((a, b) => {
      // Ordenar por: Campo → Produto → Tamanho → Status
      const campoA = (a[0] as string).toLowerCase().trim()
      const campoB = (b[0] as string).toLowerCase().trim()
      if (campoA !== campoB) {
        return campoA.localeCompare(campoB, 'pt-BR', { numeric: true })
      }

      const produtoA = (a[1] as string).toLowerCase().trim()
      const produtoB = (b[1] as string).toLowerCase().trim()
      if (produtoA !== produtoB) {
        return produtoA.localeCompare(produtoB, 'pt-BR', { numeric: true })
      }

      const tamanhoA = (a[2] as string).toLowerCase().trim()
      const tamanhoB = (b[2] as string).toLowerCase().trim()
      if (tamanhoA !== tamanhoB) {
        return tamanhoA.localeCompare(tamanhoB, 'pt-BR', { numeric: true })
      }

      const statusA = (a[3] as string).toLowerCase().trim()
      const statusB = (b[3] as string).toLowerCase().trim()
      return statusA.localeCompare(statusB, 'pt-BR', { numeric: true })
    })

  analyticsOrdenados.forEach(([campo, produto, tamanho, status, count, percentage]) => {
    produtosTamanhosData.push([
      campo as string,
      produto as string,
      tamanho as string,
      status as string,
      count as number,
      `${(percentage as number).toFixed(1)}%`
    ])
  })

  const produtosTamanhosSheet = XLSX.utils.aoa_to_sheet(produtosTamanhosData)
  XLSX.utils.book_append_sheet(workbook, produtosTamanhosSheet, 'Produtos x Tamanhos')

  // 3. TABELAS DE INSCRIÇÕES
  const inscricoesData = [
    ['TABELAS DE INSCRIÇÕES DETALHADAS'],
    [''],
    ['Nome', 'CPF', 'Evento', 'Campo', 'Produto', 'Status'],
  ]

  // Ordenar inscrições com a mesma lógica do PDF
  const sortedInscricoes = [...data.inscricoes].sort((a, b) => {
    // 1. Ordem alfabética dos campos
    const campoA = (a.expand?.campo?.nome || a.campo || '').toLowerCase().trim()
    const campoB = (b.expand?.campo?.nome || b.campo || '').toLowerCase().trim()
    if (campoA !== campoB) {
      return campoA.localeCompare(campoB, 'pt-BR', { numeric: true })
    }

    // 2. Ordem alfabética dos nomes
    const nomeA = (a.nome || '').toLowerCase().trim()
    const nomeB = (b.nome || '').toLowerCase().trim()
    if (nomeA !== nomeB) {
      return nomeA.localeCompare(nomeB, 'pt-BR', { numeric: true })
    }

    // 3. Ordem alfabética dos produtos
    const produtoA = Array.isArray(a.produto)
      ? a.produto.map(prodId => getProdutoInfo(prodId, data.produtos)).join(', ')
      : getProdutoInfo(a.produto || '', data.produtos)
    const produtoB = Array.isArray(b.produto)
      ? b.produto.map(prodId => getProdutoInfo(prodId, data.produtos)).join(', ')
      : getProdutoInfo(b.produto || '', data.produtos)
    if (produtoA !== produtoB) {
      return produtoA.toLowerCase().trim().localeCompare(produtoB.toLowerCase().trim(), 'pt-BR', { numeric: true })
    }

    // 4. Ordem alfabética dos tamanhos (se aplicável)
    const tamanhoA = (a.tamanho || '').toLowerCase().trim()
    const tamanhoB = (b.tamanho || '').toLowerCase().trim()
    if (tamanhoA !== tamanhoB) {
      return tamanhoA.localeCompare(tamanhoB, 'pt-BR', { numeric: true })
    }

    // 5. Ordem alfabética dos status
    const statusA = (a.status || '').toLowerCase().trim()
    const statusB = (b.status || '').toLowerCase().trim()
    return statusA.localeCompare(statusB, 'pt-BR', { numeric: true })
  })

  sortedInscricoes.forEach(inscricao => {
    inscricoesData.push([
      inscricao.nome || 'Não informado',
      inscricao.cpf ? formatCpf(inscricao.cpf) : 'Não informado',
      inscricao.expand?.evento?.titulo || 'Não informado',
      inscricao.expand?.campo?.nome || inscricao.campo || 'Não informado',
      Array.isArray(inscricao.produto)
        ? inscricao.produto.map((prodId: string) => getProdutoInfo(prodId, data.produtos)).join(', ')
        : getProdutoInfo(inscricao.produto || '', data.produtos),
      inscricao.status || 'Não informado',
    ])
  })

  const inscricoesSheet = XLSX.utils.aoa_to_sheet(inscricoesData)
  XLSX.utils.book_append_sheet(workbook, inscricoesSheet, 'Tabelas de Inscrições')

  // 4. TABELAS DE PEDIDOS
  const pedidosData = [
    ['TABELAS DE PEDIDOS'],
    [''],
    ['Nome', 'CPF', 'Campo', 'Produto', 'Tamanho', 'Canal', 'Status'],
  ]

  // Ordenar pedidos com a mesma lógica do PDF
  const sortedPedidos = [...data.pedidos].sort((a, b) => {
    // 1. Ordem alfabética dos campos
    const campoA = (a.expand?.campo?.nome || a.campo || '').toLowerCase().trim()
    const campoB = (b.expand?.campo?.nome || b.campo || '').toLowerCase().trim()
    if (campoA !== campoB) {
      return campoA.localeCompare(campoB, 'pt-BR', { numeric: true })
    }

    // 2. Ordem alfabética dos nomes
    const nomeA = getNomeCliente(a).toLowerCase().trim()
    const nomeB = getNomeCliente(b).toLowerCase().trim()
    if (nomeA !== nomeB) {
      return nomeA.localeCompare(nomeB, 'pt-BR', { numeric: true })
    }

    // 3. Ordem alfabética dos produtos
    const produtoA = a.produto.map(prodId => getProdutoInfo(prodId, data.produtos)).join(', ')
    const produtoB = b.produto.map(prodId => getProdutoInfo(prodId, data.produtos)).join(', ')
    if (produtoA !== produtoB) {
      return produtoA.toLowerCase().trim().localeCompare(produtoB.toLowerCase().trim(), 'pt-BR', { numeric: true })
    }

    // 4. Ordem alfabética dos tamanhos
    const tamanhoA = (a.tamanho || '').toLowerCase().trim()
    const tamanhoB = (b.tamanho || '').toLowerCase().trim()
    if (tamanhoA !== tamanhoB) {
      return tamanhoA.localeCompare(tamanhoB, 'pt-BR', { numeric: true })
    }

    // 5. Ordem alfabética dos status
    const statusA = (a.status || '').toLowerCase().trim()
    const statusB = (b.status || '').toLowerCase().trim()
    return statusA.localeCompare(statusB, 'pt-BR', { numeric: true })
  })

  sortedPedidos.forEach(pedido => {
    pedidosData.push([
      getNomeCliente(pedido),
      formatCpf(getCpfCliente(pedido)),
      pedido.expand?.campo?.nome || pedido.campo || 'Não informado',
      pedido.produto.map(prodId => getProdutoInfo(prodId, data.produtos)).join(', '),
      pedido.tamanho || 'Não informado',
      pedido.canal || 'Não informado',
      pedido.status || 'Não informado',
    ])
  })

  const pedidosSheet = XLSX.utils.aoa_to_sheet(pedidosData)
  XLSX.utils.book_append_sheet(workbook, pedidosSheet, 'Tabelas de Pedidos')

  // Gerar arquivo
  const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const finalFilename = filename || (isRelatorios
    ? (eventoSelecionado ? `relatorio_evento_${eventoSelecionado}` : 'relatorio_geral')
    : 'dashboard_executivo') + `_${new Date().toISOString().split('T')[0]}.xlsx`
  
  saveAs(blob, finalFilename)
}
