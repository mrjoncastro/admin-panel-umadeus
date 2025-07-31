import type { Inscricao, Pedido, Produto } from '@/types'
import type { jsPDF } from 'jspdf'

let autoTable: any
import {
  PDF_CONSTANTS,
  formatCpf,
  calculateInscricoesStatus,
  calculatePedidosStatus,
  calculateResumoPorTamanho,
  calculateResumoPorCampo,
  calculateInscricoesPorTamanho,
  calculateProdutosPorCanal,
  calculateProdutoTamanhoCross,
  calculateInscricoesProdutoTamanhoCross,
  getNomeCliente,
  getProdutoInfo,
  getEventoNome,
  getCpfCliente,
  normalizeDate,
} from '@/lib/utils/pdfUtils'

export class PDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number

  constructor(doc: jsPDF) {
    this.doc = doc
    this.pageWidth = doc.internal.pageSize.getWidth()
    this.pageHeight = doc.internal.pageSize.getHeight()
    this.margin = PDF_CONSTANTS.MARGIN
  }

  // Não são mais necessários métodos de cabeçalho manual ou zebra striping, já que o autoTable gerencia essas tarefas

  // Página 1 - Capa
  generateCoverPage(
    isRelatorios: boolean,
    eventoSelecionado: string | null,
  ) {
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.TITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Relatório Executivo', this.pageWidth / 2, 40, { align: 'center' })

    const subtitle = isRelatorios
      ? (eventoSelecionado ? 'Análise de Dados por Evento' : 'Análise Geral de Dados')
      : 'Dashboard Executivo'
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.text(subtitle, this.pageWidth / 2, 60, { align: 'center' })

    const currentDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.FOOTER)
    this.doc.text(`Gerado em: ${currentDate}`, this.pageWidth / 2, 80, { align: 'center' })
  }

  // Página 2 - Sumário
  generateSummaryPage() {
    this.doc.addPage()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Sumário', this.margin, 40)

    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('1. Visão Geral Executiva', this.margin, 60)
    this.doc.text('  1.1. KPIs e Resumo', this.margin, 75)
    this.doc.text('  1.2. Inscrições por Status', this.margin, 90)
    this.doc.text('  1.3. Pedidos por Status', this.margin, 105)
    this.doc.text('2. Pedidos x Tamanhos', this.margin, 140)
    this.doc.text('3. Inscrições por Status', this.margin, 160)
    this.doc.text('  3.1. Inscrições Pendentes', this.margin, 175)
    this.doc.text('  3.2. Inscrições Aguardando Pagamento', this.margin, 190)
    this.doc.text('  3.3. Inscrições Confirmadas', this.margin, 205)
    this.doc.text('  3.4. Inscrições Canceladas', this.margin, 220)
    this.doc.text('4. Pedidos por Status', this.margin, 240)
    this.doc.text('  4.1. Pedidos Pendentes', this.margin, 255)
    this.doc.text('  4.2. Pedidos Aguardando Pagamento', this.margin, 270)
    this.doc.text('  4.3. Pedidos Pagos', this.margin, 285)
    this.doc.text('  4.4. Pedidos Vencidos', this.margin, 300)
    this.doc.text('  4.5. Pedidos Cancelados', this.margin, 315)
  }

  // Página 3 - Visão Geral Executiva 
  generateOverviewPage(
    inscricoes: Inscricao[],
    pedidos: Pedido[],
    produtos: Produto[],
    valorTotal: number,
  ) {
    this.doc.addPage()

    // Título da página
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(16)
    this.doc.text('Visão Geral Executiva', this.margin, 40)

    // Calcular dados para as tabelas
    const statusInscricoes = calculateInscricoesStatus(inscricoes)
    const statusPedidos = calculatePedidosStatus(pedidos)
    const totalInscricoes = inscricoes.length
    const totalPedidos = pedidos.length

    // KPI Cards - POSICIONADOS NO INÍCIO
    const cardStartY = 60
    const cardWidth = (this.pageWidth - 2 * this.margin) / 3
    const cardHeight = 30

    // Card Inscrições
    this.doc.setFillColor(220, 38, 38) // Vermelho
    this.doc.rect(this.margin, cardStartY, cardWidth - 5, cardHeight, 'F')
    this.doc.setFontSize(10)
    this.doc.setTextColor(255, 255, 255)
    this.doc.text('Inscrições', this.margin + 5, cardStartY + 8)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(totalInscricoes.toString(), this.margin + 5, cardStartY + 20)

    // Card Pedidos
    this.doc.setFillColor(59, 130, 246) // Azul
    this.doc.rect(this.margin + cardWidth, cardStartY, cardWidth - 5, cardHeight, 'F')
    this.doc.setFontSize(10)
    this.doc.setTextColor(255, 255, 255)
    this.doc.text('Pedidos', this.margin + cardWidth + 5, cardStartY + 8)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(totalPedidos.toString(), this.margin + cardWidth + 5, cardStartY + 20)

    // Card Valor Total
    this.doc.setFillColor(34, 197, 94) // Verde
    this.doc.rect(this.margin + 2 * cardWidth, cardStartY, cardWidth - 5, cardHeight, 'F')
    this.doc.setFontSize(10)
    this.doc.setTextColor(255, 255, 255)
    this.doc.text('Valor Total', this.margin + 2 * cardWidth + 5, cardStartY + 8)
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(`R$ ${Number(valorTotal).toFixed(2)}`, this.margin + 2 * cardWidth + 5, cardStartY + 20)

    // Resetar cor do texto
    this.doc.setTextColor(0, 0, 0)

    // Seção de Inscrições por Status
    const inscricoesStartY = cardStartY + cardHeight + 20
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Inscrições por Status', this.margin, inscricoesStartY - 10)

    // Gerar tabelas de inscrições por status na visão geral
    this.generateOverviewInscricoesByStatus(inscricoes, produtos, inscricoesStartY)

    // Obter posição Y após as tabelas de inscrições
    const lastAutoTable = (this.doc as any).lastAutoTable
    const inscricoesEndY = lastAutoTable ? lastAutoTable.finalY : inscricoesStartY + 100

    // Seção de Pedidos por Status
    const pedidosStartY = inscricoesEndY + 20
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Pedidos por Status', this.margin, pedidosStartY - 10)

    // Gerar tabelas de pedidos por status na visão geral
    this.generateOverviewPedidosByStatus(pedidos, produtos, pedidosStartY)

    // Obter posição Y após as tabelas de pedidos
    const lastAutoTable2 = (this.doc as any).lastAutoTable
    const pedidosEndY = lastAutoTable2 ? lastAutoTable2.finalY : pedidosStartY + 100

    // Tabela Analítica de Pedidos será movida para nova página
  }

  // Função auxiliar para gerar tabelas de inscrições por status na visão geral
  private generateOverviewInscricoesByStatus(
    inscricoes: Inscricao[],
    produtos: Produto[],
    startY: number,
  ) {
    const statuses = [
      { status: 'pendente', label: 'Pendentes' },
      { status: 'aguardando_pagamento', label: 'Aguardando Pagamento' },
      { status: 'confirmado', label: 'Confirmadas' },
      { status: 'cancelado', label: 'Canceladas' },
    ]

    let currentY = startY

    statuses.forEach(({ status, label }) => {
      const filteredInscricoes = inscricoes.filter(i => i.status === status)
      
      if (filteredInscricoes.length === 0) {
        return // Pular se não há inscrições com este status
      }

      // Título da subseção
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`Inscrições ${label} (${filteredInscricoes.length})`, this.margin, currentY)

      // Agrupar inscrições por campo e produto
      const groupedData = new Map<string, Map<string, number>>()
      
      filteredInscricoes.forEach(inscricao => {
        const campo = inscricao.expand?.campo?.nome || inscricao.campo || 'Não informado'
        
        if (Array.isArray(inscricao.produto)) {
          inscricao.produto.forEach(prodId => {
            const produto = getProdutoInfo(prodId, produtos)
            const key = `${campo}|${produto}`
            
            if (!groupedData.has(campo)) {
              groupedData.set(campo, new Map())
            }
            
            const campoMap = groupedData.get(campo)!
            campoMap.set(produto, (campoMap.get(produto) || 0) + 1)
          })
        } else {
          const produto = getProdutoInfo(inscricao.produto || '', produtos)
          const key = `${campo}|${produto}`
          
          if (!groupedData.has(campo)) {
            groupedData.set(campo, new Map())
          }
          
          const campoMap = groupedData.get(campo)!
          campoMap.set(produto, (campoMap.get(produto) || 0) + 1)
        }
      })

      // Calcular totais e percentuais
      const totalInscricoes = filteredInscricoes.length
      const rows: string[][] = []
      
      // Ordenar campos alfabeticamente
      const sortedCampos = Array.from(groupedData.keys()).sort((a, b) => 
        a.toLowerCase().localeCompare(b.toLowerCase(), 'pt-BR', { numeric: true })
      )
      
      sortedCampos.forEach(campo => {
        const campoMap = groupedData.get(campo)!
        
        // Ordenar produtos alfabeticamente
        const sortedProdutos = Array.from(campoMap.keys()).sort((a, b) => 
          a.toLowerCase().localeCompare(b.toLowerCase(), 'pt-BR', { numeric: true })
        )
        
        sortedProdutos.forEach(produto => {
          const total = campoMap.get(produto)!
          const percentual = ((total / totalInscricoes) * 100).toFixed(1)
          
          rows.push([
            campo,
            produto,
            total.toString(),
            `${percentual}%`
          ])
        })
      })

      // Gerar tabela
      autoTable(this.doc, {
        startY: currentY + 5,
        margin: { left: this.margin, right: this.margin },
        head: [['Campo', 'Produto', 'Total', '% do Total']],
        body: rows,
        theme: 'striped',
        headStyles: {
          fillColor: PDF_CONSTANTS.COLORS.HEADER_BG as [number, number, number],
          fontStyle: 'bold',
          halign: 'center',
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
        },
        columnStyles: {
          0: { cellWidth: 50, overflow: 'linebreak' },
          1: { cellWidth: 50, overflow: 'linebreak' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
        },
      })

      // Atualizar posição Y para próxima tabela
      const lastAutoTable = (this.doc as any).lastAutoTable
      currentY = lastAutoTable ? lastAutoTable.finalY + 10 : currentY + 50
    })
  }

  // Função auxiliar para gerar tabelas de pedidos por status na visão geral
  private generateOverviewPedidosByStatus(
    pedidos: Pedido[],
    produtos: Produto[],
    startY: number,
  ) {
    const statuses = [
      { status: 'pendente', label: 'Pendentes' },
      { status: 'aguardando_pagamento', label: 'Aguardando Pagamento' },
      { status: 'pago', label: 'Pagos' },
      { status: 'vencido', label: 'Vencidos' },
      { status: 'cancelado', label: 'Cancelados' },
    ]

    let currentY = startY

    statuses.forEach(({ status, label }) => {
      const filteredPedidos = pedidos.filter(p => p.status === status)
      
      if (filteredPedidos.length === 0) {
        return // Pular se não há pedidos com este status
      }

      // Título da subseção
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`Pedidos ${label} (${filteredPedidos.length})`, this.margin, currentY)

      // Agrupar pedidos por campo e produto
      const groupedData = new Map<string, Map<string, number>>()
      
      filteredPedidos.forEach(pedido => {
        const campo = pedido.expand?.campo?.nome || pedido.campo || 'Não informado'
        
        if (Array.isArray(pedido.produto)) {
          pedido.produto.forEach(prodId => {
            const produto = getProdutoInfo(prodId, produtos)
            
            if (!groupedData.has(campo)) {
              groupedData.set(campo, new Map())
            }
            
            const campoMap = groupedData.get(campo)!
            campoMap.set(produto, (campoMap.get(produto) || 0) + 1)
          })
        } else {
          const produto = getProdutoInfo(pedido.produto || '', produtos)
          
          if (!groupedData.has(campo)) {
            groupedData.set(campo, new Map())
          }
          
          const campoMap = groupedData.get(campo)!
          campoMap.set(produto, (campoMap.get(produto) || 0) + 1)
        }
      })

      // Calcular totais e percentuais
      const totalPedidos = filteredPedidos.length
      const rows: string[][] = []
      
      // Ordenar campos alfabeticamente
      const sortedCampos = Array.from(groupedData.keys()).sort((a, b) => 
        a.toLowerCase().localeCompare(b.toLowerCase(), 'pt-BR', { numeric: true })
      )
      
      sortedCampos.forEach(campo => {
        const campoMap = groupedData.get(campo)!
        
        // Ordenar produtos alfabeticamente
        const sortedProdutos = Array.from(campoMap.keys()).sort((a, b) => 
          a.toLowerCase().localeCompare(b.toLowerCase(), 'pt-BR', { numeric: true })
        )
        
        sortedProdutos.forEach(produto => {
          const total = campoMap.get(produto)!
          const percentual = ((total / totalPedidos) * 100).toFixed(1)
          
          rows.push([
            campo,
            produto,
            total.toString(),
            `${percentual}%`
          ])
        })
      })

      // Gerar tabela
      autoTable(this.doc, {
        startY: currentY + 5,
        margin: { left: this.margin, right: this.margin },
        head: [['Campo', 'Produto', 'Total', '% do Total']],
        body: rows,
        theme: 'striped',
        headStyles: {
          fillColor: PDF_CONSTANTS.COLORS.HEADER_BG as [number, number, number],
          fontStyle: 'bold',
          halign: 'center',
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
        },
        columnStyles: {
          0: { cellWidth: 50, overflow: 'linebreak' },
          1: { cellWidth: 50, overflow: 'linebreak' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
        },
      })

      // Atualizar posição Y para próxima tabela
      const lastAutoTable = (this.doc as any).lastAutoTable
      currentY = lastAutoTable ? lastAutoTable.finalY + 10 : currentY + 50
    })
  }

  // Página 4 - Análise de Pedidos
  generatePedidosAnalyticsPage(
    pedidos: Pedido[],
    produtos: Produto[],
  ) {
    this.doc.addPage()

    // Título da página
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(16)
    this.doc.text('Produtos x Tamanhos', this.margin, 40)

    // Preparar dados analíticos de pedidos
    const pedAnalyticData = this.calculatePedidosAnalytics(pedidos, produtos)
    const pedAnalyticRows = pedAnalyticData.map(([campo, produto, tamanho, count, percentage]) => [
      campo,
      produto,
      tamanho,
      count.toString(),
      `${Number(percentage).toFixed(1)}%`
    ])

    autoTable(this.doc, {
      startY: 60,
      margin: { left: this.margin, right: this.margin },
      head: [['Campo', 'Produto', 'Tamanho', 'Total', '% do Total']],
      body: pedAnalyticRows,
      theme: 'striped',
      headStyles: {
        fillColor: PDF_CONSTANTS.COLORS.HEADER_BG as [number, number, number],
        fontStyle: 'bold',
        halign: 'center',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', cellWidth: 25 }
      },
      pageBreak: 'auto'
    })
  }

  // Métodos auxiliares para calcular dados analíticos

  private calculatePedidosTotals(pedidos: Pedido[], produtos: Produto[]) {
    const analytics = new Map<string, [string, string, string, number, number]>()

    pedidos.forEach(pedido => {
      const campo = pedido.expand?.campo?.nome || 'N/A'
      // Tratar produto que pode ser string ou array
      const produtoId = Array.isArray(pedido.produto) ? pedido.produto[0] : pedido.produto
      const produto = getProdutoInfo(produtoId || '', produtos)
      const status = pedido.status || 'N/A'
      const key = `${campo}-${produto}-${status}`

      if (analytics.has(key)) {
        const [, , , count] = analytics.get(key)!
        analytics.set(key, [campo, produto, status, count + 1, 0])
      } else {
        analytics.set(key, [campo, produto, status, 1, 0])
      }
    })

    // Calcular percentuais
    const total = pedidos.length
    const result = Array.from(analytics.values()).map(([campo, produto, status, count]) =>
      [campo, produto, status, count, (count / total) * 100]
    )

    // Ordenar por: Campo → Produto → Status
    return result.sort((a, b) => {
      // 1. Ordem alfabética dos campos
      const campoA = (a[0] as string).toLowerCase().trim()
      const campoB = (b[0] as string).toLowerCase().trim()
      if (campoA !== campoB) {
        return campoA.localeCompare(campoB, 'pt-BR', { numeric: true })
      }

      // 2. Ordem alfabética dos produtos
      const produtoA = (a[1] as string).toLowerCase().trim()
      const produtoB = (b[1] as string).toLowerCase().trim()
      if (produtoA !== produtoB) {
        return produtoA.localeCompare(produtoB, 'pt-BR', { numeric: true })
      }

      // 3. Ordem alfabética dos status
      const statusA = (a[2] as string).toLowerCase().trim()
      const statusB = (b[2] as string).toLowerCase().trim()
      return statusA.localeCompare(statusB, 'pt-BR', { numeric: true })
    })
  }

  private calculatePedidosAnalytics(pedidos: Pedido[], produtos: Produto[]) {
    const analytics = new Map<string, [string, string, string, number, number]>()

    pedidos.forEach(pedido => {
      const campo = pedido.expand?.campo?.nome || 'N/A'
      // Tratar produto que pode ser string ou array
      const produtoId = Array.isArray(pedido.produto) ? pedido.produto[0] : pedido.produto
      const produto = getProdutoInfo(produtoId || '', produtos)
      const tamanho = pedido.tamanho || 'N/A'
      const key = `${campo}-${produto}-${tamanho}`

      if (analytics.has(key)) {
        const [, , , count] = analytics.get(key)!
        analytics.set(key, [campo, produto, tamanho, count + 1, 0])
      } else {
        analytics.set(key, [campo, produto, tamanho, 1, 0])
      }
    })

    // Calcular percentuais
    const total = pedidos.length
    const result = Array.from(analytics.values()).map(([campo, produto, tamanho, count]) =>
      [campo, produto, tamanho, count, (count / total) * 100]
    )

    // Ordenar por: Campo → Produto → Tamanho
    return result.sort((a, b) => {
      // 1. Ordem alfabética dos campos
      const campoA = (a[0] as string).toLowerCase().trim()
      const campoB = (b[0] as string).toLowerCase().trim()
      if (campoA !== campoB) {
        return campoA.localeCompare(campoB, 'pt-BR', { numeric: true })
      }

      // 2. Ordem alfabética dos produtos
      const produtoA = (a[1] as string).toLowerCase().trim()
      const produtoB = (b[1] as string).toLowerCase().trim()
      if (produtoA !== produtoB) {
        return produtoA.localeCompare(produtoB, 'pt-BR', { numeric: true })
      }

      // 3. Ordem alfabética dos tamanhos
      const tamanhoA = (a[2] as string).toLowerCase().trim()
      const tamanhoB = (b[2] as string).toLowerCase().trim()
      return tamanhoA.localeCompare(tamanhoB, 'pt-BR', { numeric: true })
    })
  }







  // Página 5 - Tabelas de Inscrições
  // Função auxiliar para gerar tabela de inscrições por status
  private generateInscricoesByStatus(
    inscricoes: Inscricao[],
    produtos: Produto[],
    status: string,
    statusLabel: string,
  ) {
    const filteredInscricoes = inscricoes.filter(i => i.status === status)
    
    if (filteredInscricoes.length === 0) {
      return // Não criar página se não há inscrições com este status
    }

    const headers = [
      'Nome',
      'CPF',
      'Evento',
      'Campo',
      'Produto',
      'Status',
    ]

    this.doc.addPage('l')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Inscrições por Status', this.margin, 40)

    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text(`Inscrições ${statusLabel} (${filteredInscricoes.length})`, this.margin, 75)

    const sortedInscricoes = [...filteredInscricoes].sort((a, b) => {
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
        ? a.produto.map(prodId => getProdutoInfo(prodId, produtos)).join(', ')
        : getProdutoInfo(a.produto || '', produtos)
      const produtoB = Array.isArray(b.produto)
        ? b.produto.map(prodId => getProdutoInfo(prodId, produtos)).join(', ')
        : getProdutoInfo(b.produto || '', produtos)
      if (produtoA !== produtoB) {
        return produtoA.toLowerCase().trim().localeCompare(produtoB.toLowerCase().trim(), 'pt-BR', { numeric: true })
      }

      // 4. Ordem alfabética dos tamanhos (se aplicável)
      const tamanhoA = (a.tamanho || '').toLowerCase().trim()
      const tamanhoB = (b.tamanho || '').toLowerCase().trim()
      if (tamanhoA !== tamanhoB) {
        return tamanhoA.localeCompare(tamanhoB, 'pt-BR', { numeric: true })
      }

      return 0 // Mesmo status, então ordem alfabética já foi aplicada
    })

    const rows = sortedInscricoes.map(inscricao => {
      const cpfValue = inscricao.cpf
      const cpfFormatted = cpfValue ? formatCpf(cpfValue) : 'Não informado'
      
      return [
        inscricao.nome || 'Não informado',
        cpfFormatted,
        inscricao.expand?.evento?.titulo || 'Não informado',
        inscricao.expand?.campo?.nome || inscricao.campo || 'Não informado',
        Array.isArray(inscricao.produto)
          ? inscricao.produto.map((prodId: string) => getProdutoInfo(prodId, produtos)).join(', ')
          : getProdutoInfo(inscricao.produto || '', produtos),
        inscricao.status || 'Não informado',
      ]
    })

    autoTable(this.doc, {
      startY: 100,
      head: [headers],
      body: rows,
      theme: 'grid',
      alternateRowStyles: {
        fillColor: PDF_CONSTANTS.COLORS.ROW_ALT_BG as [number, number, number],
      },
      tableLineWidth: 0.1,
      tableLineColor: PDF_CONSTANTS.COLORS.BORDER as [number, number, number],
      margin: { left: this.margin, right: this.margin },
      headStyles: {
        fillColor: PDF_CONSTANTS.COLORS.HEADER_BG as [number, number, number],
        halign: 'center',
        fontStyle: 'bold',
        lineColor: PDF_CONSTANTS.COLORS.BORDER as [number, number, number],
        lineWidth: 0.1,
      },
      styles: {
        fontSize: PDF_CONSTANTS.FONT_SIZES.TABLE_DATA,
        cellPadding: PDF_CONSTANTS.DIMENSIONS.CELL_PADDING,
        minCellHeight: PDF_CONSTANTS.SPACING.TABLE_ROW_HEIGHT,
      },
      columnStyles: {
        0: { cellWidth: 40, overflow: 'linebreak' },
        1: { cellWidth: 32, halign: 'right' },
        2: { cellWidth: 28, overflow: 'linebreak' },
        3: { cellWidth: 25 },
        4: { cellWidth: 30, overflow: 'linebreak' },
        5: { cellWidth: 22 },
      },
    })
  }

  // Gerar todas as tabelas de inscrições por status
  generateInscricoesByStatusTables(
    inscricoes: Inscricao[],
    produtos: Produto[],
  ) {
    // Inscrições Pendentes
    this.generateInscricoesByStatus(inscricoes, produtos, 'pendente', 'Pendentes')
    
    // Inscrições Aguardando Pagamento
    this.generateInscricoesByStatus(inscricoes, produtos, 'aguardando_pagamento', 'Aguardando Pagamento')
    
    // Inscrições Confirmadas
    this.generateInscricoesByStatus(inscricoes, produtos, 'confirmado', 'Confirmadas')
    
    // Inscrições Canceladas
    this.generateInscricoesByStatus(inscricoes, produtos, 'cancelado', 'Canceladas')
  }

  // Função auxiliar para gerar tabela de pedidos por status
  private generatePedidosByStatus(
    pedidos: Pedido[],
    produtos: Produto[],
    status: string,
    statusLabel: string,
  ) {
    const filteredPedidos = pedidos.filter(p => p.status === status)
    
    if (filteredPedidos.length === 0) {
      return // Não criar página se não há pedidos com este status
    }

    const headers = [
      'Nome',
      'CPF',
      'Campo',
      'Produto',
      'Tamanho',
      'Canal',
      'Status',
    ]

    this.doc.addPage('l')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Pedidos por Status', this.margin, 40)

    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text(`Pedidos ${statusLabel} (${filteredPedidos.length})`, this.margin, 75)

    const sortedPedidos = [...filteredPedidos].sort((a, b) => {
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
      const produtoA = a.produto.map(prodId => getProdutoInfo(prodId, produtos)).join(', ')
      const produtoB = b.produto.map(prodId => getProdutoInfo(prodId, produtos)).join(', ')
      if (produtoA !== produtoB) {
        return produtoA.toLowerCase().trim().localeCompare(produtoB.toLowerCase().trim(), 'pt-BR', { numeric: true })
      }

      // 4. Ordem alfabética dos tamanhos
      const tamanhoA = (a.tamanho || '').toLowerCase().trim()
      const tamanhoB = (b.tamanho || '').toLowerCase().trim()
      if (tamanhoA !== tamanhoB) {
        return tamanhoA.localeCompare(tamanhoB, 'pt-BR', { numeric: true })
      }

      return 0 // Mesmo status, então ordem alfabética já foi aplicada
    })

    const rows = sortedPedidos.map(pedido => [
      getNomeCliente(pedido),
      formatCpf(getCpfCliente(pedido)),
      pedido.expand?.campo?.nome || pedido.campo || 'Não informado',
      pedido.produto.map(prodId => getProdutoInfo(prodId, produtos)).join(', '),
      pedido.tamanho || 'Não informado',
      pedido.canal || 'Não informado',
      pedido.status || 'Não informado',
    ])

    autoTable(this.doc, {
      startY: 100,
      head: [headers],
      body: rows,
      theme: 'grid',
      alternateRowStyles: {
        fillColor: PDF_CONSTANTS.COLORS.ROW_ALT_BG as [number, number, number],
      },
      tableLineWidth: 0.1,
      tableLineColor: PDF_CONSTANTS.COLORS.BORDER as [number, number, number],
      margin: { left: this.margin, right: this.margin },
      headStyles: {
        fillColor: PDF_CONSTANTS.COLORS.HEADER_BG as [number, number, number],
        halign: 'center',
        fontStyle: 'bold',
        lineColor: PDF_CONSTANTS.COLORS.BORDER as [number, number, number],
        lineWidth: 0.1,
      },
      styles: {
        fontSize: PDF_CONSTANTS.FONT_SIZES.TABLE_DATA,
        cellPadding: PDF_CONSTANTS.DIMENSIONS.CELL_PADDING,
        minCellHeight: PDF_CONSTANTS.SPACING.TABLE_ROW_HEIGHT,
      },
      columnStyles: {
        0: { cellWidth: 35, overflow: 'linebreak' },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 25, overflow: 'linebreak' },
        3: { cellWidth: 30, overflow: 'linebreak' },
        4: { cellWidth: 20 },
        5: { cellWidth: 24, halign: 'center' },
        6: { cellWidth: 18, halign: 'center' },
      },
    })
  }

  // Gerar todas as tabelas de pedidos por status
  generatePedidosByStatusTables(
    pedidos: Pedido[],
    produtos: Produto[],
  ) {
    // Pedidos Pendentes
    this.generatePedidosByStatus(pedidos, produtos, 'pendente', 'Pendentes')
    
    // Pedidos Aguardando Pagamento
    this.generatePedidosByStatus(pedidos, produtos, 'aguardando_pagamento', 'Aguardando Pagamento')
    
    // Pedidos Pagos
    this.generatePedidosByStatus(pedidos, produtos, 'pago', 'Pagos')
    
    // Pedidos Vencidos
    this.generatePedidosByStatus(pedidos, produtos, 'vencido', 'Vencidos')
    
    // Pedidos Cancelados
    this.generatePedidosByStatus(pedidos, produtos, 'cancelado', 'Cancelados')
  }




  public addFooter(pageNumber: number, totalPages: number) {
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.FOOTER)
    this.doc.text(`Página ${pageNumber} de ${totalPages}`, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' })
    this.doc.text('Desenvolvido por M24', this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' })
  }

}

export async function generatePDF(
  inscricoes: Inscricao[],
  pedidos: Pedido[],
  produtos: Produto[],
  valorTotal: number
) {
  const { default: jsPDF } = await import('jspdf')
  autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const generator = new PDFGenerator(doc)

  // Determinar o contexto
  const isRelatorios = window.location.pathname.includes('/relatorios')
  const urlParams = new URLSearchParams(window.location.search)
  const eventoFiltro = urlParams.get('evento')
  const eventoSelecionado = eventoFiltro && eventoFiltro !== 'todos' ? eventoFiltro : null

  // Gerar páginas
  generator.generateCoverPage(isRelatorios, eventoSelecionado)
  generator.generateSummaryPage()
  generator.generateOverviewPage(inscricoes, pedidos, produtos, valorTotal)
  generator.generatePedidosAnalyticsPage(pedidos, produtos)
  generator.generateInscricoesByStatusTables(inscricoes, produtos)
  generator.generatePedidosByStatusTables(pedidos, produtos)

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    generator.addFooter(i, totalPages)
  }

  // Salvar PDF
  const fileName = isRelatorios
    ? (eventoSelecionado ? `relatorio_evento_${eventoSelecionado}` : 'relatorio_geral')
    : 'dashboard_executivo'

  doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`)

  // Restaurar botão
  const button = document.querySelector('[data-pdf-button]') as HTMLButtonElement
  if (button) {
    button.innerHTML = '<span>Relatório PDF</span>'
    button.disabled = false
  }
} 