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
    this.doc.text('1. Panorama Geral - Pedidos', this.margin, 60)
    this.doc.text('2. Panorama Geral - Inscrições', this.margin, 80)
    this.doc.text('3. Tabelas de Análise', this.margin, 100)
    this.doc.text('4. Tabelas de Pedidos', this.margin, 120)
  }



  // Página 3 - Panorama Geral Pedidos
  generatePedidosOverview(
    pedidos: Pedido[],
    produtos: Produto[],
  ) {
    this.doc.addPage()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Panorama Geral', this.margin, 40)

    const resumoPorTamanho = calculateResumoPorTamanho(pedidos, produtos)
    const statusPedidos = calculatePedidosStatus(pedidos)
    const produtosPorCanal = calculateProdutosPorCanal(pedidos)
    const crossData = calculateProdutoTamanhoCross(pedidos, produtos)

    // Tabela de resumo
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Resumo por Tamanho/Itens', this.margin, 70)

    const resumoRows = Object.entries(resumoPorTamanho).map(([tamanho, dados]) => [
      tamanho.substring(0, 15),
      dados.quantidade,
      Array.from(dados.produtos).join(', '),
    ])

    autoTable(this.doc, {
      startY: 90,
      head: [['Tamanho', 'Quantidade', 'Produtos']],
      body: resumoRows,
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      headStyles: {
        fillColor: PDF_CONSTANTS.COLORS.HEADER_BG as [number, number, number],
        fontStyle: 'bold',
        halign: 'center',
        lineColor: PDF_CONSTANTS.COLORS.BORDER as [number, number, number],
        lineWidth: 0.1,
      },
      styles: {
        fontSize: PDF_CONSTANTS.FONT_SIZES.TABLE_DATA,
        cellPadding: PDF_CONSTANTS.DIMENSIONS.CELL_PADDING,
        overflow: 'linebreak',
        minCellHeight: PDF_CONSTANTS.SPACING.TABLE_ROW_HEIGHT,
      },
      columnStyles: { 1: { halign: 'right' } },
    })

    const lastY =
      (this.doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ??
      90

    // Tabela cruzada Produto x Tamanho
    const tamanhos = Array.from(
      new Set(
        Object.values(crossData).flatMap(obj => Object.keys(obj)),
      ),
    )
    const crossRows = Object.entries(crossData).map(([produto, valores]) => [
      produto.substring(0, 15),
      ...tamanhos.map(t => valores[t] || 0),
    ])
    const crossHead = ['Produto', ...tamanhos]

    autoTable(this.doc, {
      startY: lastY + 20,
      head: [crossHead],
      body: crossRows,
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      headStyles: {
        fillColor: PDF_CONSTANTS.COLORS.HEADER_BG as [number, number, number],
        fontStyle: 'bold',
        halign: 'center',
        lineColor: PDF_CONSTANTS.COLORS.BORDER as [number, number, number],
        lineWidth: 0.1,
      },
      styles: {
        fontSize: PDF_CONSTANTS.FONT_SIZES.TABLE_DATA,
        cellPadding: PDF_CONSTANTS.DIMENSIONS.CELL_PADDING,
        overflow: 'linebreak',
        minCellHeight: PDF_CONSTANTS.SPACING.TABLE_ROW_HEIGHT,
      },
      columnStyles: Object.fromEntries(
        crossHead.map((_, idx) => (idx === 0 ? [idx, {}] : [idx, { halign: 'right' }])),
      ),
    })

    const afterCross =
      (this.doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ??
      lastY + 20

    // Gráficos
    this.generateCharts(resumoPorTamanho, statusPedidos, produtosPorCanal, afterCross + 20)
  }

  // Página 4 - Panorama Geral Inscrições
  generateInscricoesOverview(
    inscricoes: Inscricao[],
    produtos: Produto[],
  ) {
    this.doc.addPage()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Panorama Geral - Inscrições', this.margin, 40)

    const resumoPorTamanhoInscricoes = calculateInscricoesPorTamanho(
      inscricoes,
      produtos,
    )
    const statusInscricoes = calculateInscricoesStatus(inscricoes)
    const resumoPorCampo = calculateResumoPorCampo(inscricoes)
    const crossData = calculateInscricoesProdutoTamanhoCross(inscricoes, produtos)

    // Tabela de resumo
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Resumo por Tamanho/Itens - Inscrições', this.margin, 70)

    const resumoRowsInscr = Object.entries(resumoPorTamanhoInscricoes).map(
      ([tamanho, dados]) => [
        tamanho.substring(0, 15),
        dados.quantidade,
        Array.from(dados.produtos).join(', '),
      ],
    )

    autoTable(this.doc, {
      startY: 90,
      head: [['Tamanho', 'Quantidade', 'Produtos']],
      body: resumoRowsInscr,
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      headStyles: {
        fillColor: PDF_CONSTANTS.COLORS.HEADER_BG as [number, number, number],
        fontStyle: 'bold',
        halign: 'center',
        lineColor: PDF_CONSTANTS.COLORS.BORDER as [number, number, number],
        lineWidth: 0.1,
      },
      styles: {
        fontSize: PDF_CONSTANTS.FONT_SIZES.TABLE_DATA,
        cellPadding: PDF_CONSTANTS.DIMENSIONS.CELL_PADDING,
        overflow: 'linebreak',
        minCellHeight: PDF_CONSTANTS.SPACING.TABLE_ROW_HEIGHT,
      },
      columnStyles: { 1: { halign: 'right' } },
    })

    const lastYInscr =
      (this.doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ??
      90

    // Tabela cruzada Produto x Tamanho
    const tamanhosInscr = Array.from(
      new Set(Object.values(crossData).flatMap(obj => Object.keys(obj))),
    )
    const crossRowsInscr = Object.entries(crossData).map(([produto, valores]) => [
      produto.substring(0, 15),
      ...tamanhosInscr.map(t => valores[t] || 0),
    ])
    const crossHeadInscr = ['Produto', ...tamanhosInscr]

    autoTable(this.doc, {
      startY: lastYInscr + 20,
      head: [crossHeadInscr],
      body: crossRowsInscr,
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      headStyles: {
        fillColor: PDF_CONSTANTS.COLORS.HEADER_BG as [number, number, number],
        fontStyle: 'bold',
        halign: 'center',
        lineColor: PDF_CONSTANTS.COLORS.BORDER as [number, number, number],
        lineWidth: 0.1,
      },
      styles: {
        fontSize: PDF_CONSTANTS.FONT_SIZES.TABLE_DATA,
        cellPadding: PDF_CONSTANTS.DIMENSIONS.CELL_PADDING,
        overflow: 'linebreak',
        minCellHeight: PDF_CONSTANTS.SPACING.TABLE_ROW_HEIGHT,
      },
      columnStyles: Object.fromEntries(
        crossHeadInscr.map((_, idx) => (idx === 0 ? [idx, {}] : [idx, { halign: 'right' }])),
      ),
    })

    const afterCrossInscr =
      (this.doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ??
      lastYInscr + 20

    // Gráficos
    this.generateInscricoesCharts(
      resumoPorTamanhoInscricoes,
      statusInscricoes,
      resumoPorCampo,
      afterCrossInscr + 20,
    )
  }

  // Página 5 - Tabelas de Inscrições
  generateInscricoesTable(
    inscricoes: Inscricao[],
    produtos: Produto[],
  ) {
    const headers = [
      'Nome',
      'CPF',
      'Evento',
      'Campo',
      'Produto',
      'Status',
    ]

    const orientation = headers.length > 8 ? 'landscape' : 'portrait'
    this.doc.addPage(orientation === 'landscape' ? 'l' : 'p')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Tabelas de Inscrições Detalhadas', this.margin, 40)

    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Inscrições Detalhadas', this.margin, 75)

    const sortedInscricoes = [...inscricoes].sort((a, b) =>
      (a.nome || '').localeCompare(b.nome || '', 'pt-BR'),
    )

    const rows = sortedInscricoes.map(inscricao => [
      inscricao.nome || 'Não informado',
      formatCpf(inscricao.cpf || inscricao.id),
      getEventoNome(inscricao.produto || '', produtos),
      inscricao.expand?.campo?.nome || inscricao.campo || 'Não informado',
      getProdutoInfo(inscricao.produto || '', produtos),
      inscricao.status || 'Não informado',
    ])

    autoTable(this.doc, {
      startY: 100,
      head: [headers],
      body: rows,
      theme: 'grid',
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
        1: { cellWidth: 25, halign: 'right' },
        2: { cellWidth: 28, overflow: 'linebreak' },
        3: { cellWidth: 25 },
        4: { cellWidth: 30, overflow: 'linebreak' },
        5: { cellWidth: 22 },
      },
    })
  }

  // Página 6 - Tabelas de Pedidos
  generatePedidosTable(
    pedidos: Pedido[],
    produtos: Produto[],
  ) {
    const headers = [
      'Nome',
      'CPF',
      'Campo',
      'Produto',
      'Tamanho',
      'Canal',
      'Status',
    ]

    const orientation = headers.length > 8 ? 'landscape' : 'portrait'
    this.doc.addPage(orientation === 'landscape' ? 'l' : 'p')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Tabelas de Pedidos', this.margin, 40)

    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Pedidos Detalhados', this.margin, 75)

    const sortedPedidos = [...pedidos].sort((a, b) =>
      getNomeCliente(a).localeCompare(getNomeCliente(b), 'pt-BR'),
    )

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
        1: { cellWidth: 22, halign: 'right' },
        2: { cellWidth: 25, overflow: 'linebreak' },
        3: { cellWidth: 30, overflow: 'linebreak' },
        4: { cellWidth: 16 },
        5: { cellWidth: 24 },
        6: { cellWidth: 18 },
      },
    })
  }


  private generateCharts(
    resumoPorTamanho: Record<string, { quantidade: number; produtos: Set<string> }>,
    statusPedidos: Record<string, number>,
    produtosPorCanal: Record<string, number>,
    startY: number,
  ) {
    // Gráfico por tamanho
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Distribuição por Tamanho', this.margin, startY)

    const tamanhosData = Object.entries(resumoPorTamanho) as [string, { quantidade: number; produtos: Set<string> }][]
    const maxTamanhos = Math.max(...tamanhosData.map(([, dados]) => dados.quantidade), 1)
    let yChart = startY + 20

    tamanhosData.forEach(([tamanho, dados], index) => {
      const barWidth = (dados.quantidade / maxTamanhos) * 80
      const barY = yChart + (index * PDF_CONSTANTS.SPACING.CHART_BAR_SPACING)
      
      if (barY > this.pageHeight - 60) return

      this.doc.setFontSize(8)
      this.doc.text(`${tamanho}: ${dados.quantidade}`, this.margin, barY + 2)
      
      const color = PDF_CONSTANTS.COLORS.PRIMARY
      this.doc.setFillColor(color[0], color[1], color[2])
      this.doc.rect(this.margin + 60, barY, barWidth, PDF_CONSTANTS.SPACING.CHART_BAR_HEIGHT, 'F')
      
      this.doc.setDrawColor(0)
      this.doc.setLineWidth(0.2)
      this.doc.rect(this.margin + 60, barY, barWidth, PDF_CONSTANTS.SPACING.CHART_BAR_HEIGHT)
    })

    // Gráfico de status dos pedidos
    const afterBar = yChart + tamanhosData.length * PDF_CONSTANTS.SPACING.CHART_BAR_SPACING
    this.generatePedidosStatusChart(statusPedidos, afterBar + 20)

    // Gráfico de produtos por canal
    this.generateCanalPieChart(produtosPorCanal, afterBar + 60)
  }

  private generateInscricoesCharts(
    resumoPorTamanho: Record<string, { quantidade: number; produtos: Set<string> }>,
    statusInscricoes: Record<string, number>,
    resumoPorCampo: Record<string, number>,
    startY: number
  ) {
    // Gráfico por tamanho
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Distribuição por Tamanho - Inscrições', this.margin, startY)

    const tamanhosData = Object.entries(resumoPorTamanho) as [string, { quantidade: number; produtos: Set<string> }][]
    const maxTamanhos = Math.max(...tamanhosData.map(([, dados]) => dados.quantidade), 1)
    let yChart = startY + 20

    tamanhosData.forEach(([tamanho, dados], index) => {
      const barWidth = (dados.quantidade / maxTamanhos) * 80
      const barY = yChart + (index * PDF_CONSTANTS.SPACING.CHART_BAR_SPACING)
      
      if (barY > this.pageHeight - 60) return

      this.doc.setFontSize(8)
      this.doc.text(`${tamanho}: ${dados.quantidade}`, this.margin, barY + 2)
      
      const color = PDF_CONSTANTS.COLORS.PRIMARY
      this.doc.setFillColor(color[0], color[1], color[2])
      this.doc.rect(this.margin + 60, barY, barWidth, PDF_CONSTANTS.SPACING.CHART_BAR_HEIGHT, 'F')
      
      this.doc.setDrawColor(0)
      this.doc.setLineWidth(0.2)
      this.doc.rect(this.margin + 60, barY, barWidth, PDF_CONSTANTS.SPACING.CHART_BAR_HEIGHT)
    })

    // Gráficos de status e campo
    this.generateInscricoesStatusCharts(statusInscricoes, resumoPorCampo, yChart + 120)
  }

  private generateStatusCharts(statusData: Record<string, number>, startY: number) {
    // Status das inscrições
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Status das Inscrições', this.margin, startY)

    const inscricoesData = Object.entries(statusData) as [string, number][]
    let yChart = startY + 20

    inscricoesData.forEach(([status, count], index) => {
      const barWidth = (count / Math.max(...inscricoesData.map(([, c]) => c), 1)) * 60
      const barY = yChart + (index * 12)
      
      if (barY > this.pageHeight - 60) return

      this.doc.setFontSize(7)
      this.doc.text(`${status}: ${count}`, this.margin, barY + 1)
      
      const color = PDF_CONSTANTS.COLORS.PRIMARY
      this.doc.setFillColor(color[0], color[1], color[2])
      this.doc.rect(this.margin + 50, barY, barWidth, 8, 'F')
      this.doc.setDrawColor(0)
      this.doc.setLineWidth(0.2)
      this.doc.rect(this.margin + 50, barY, barWidth, 8)
    })

    // Status dos pedidos
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Status dos Pedidos', this.margin, yChart + 60)

    const pedidosData = Object.entries(statusData) as [string, number][]
    yChart += 80

    pedidosData.forEach(([status, count], index) => {
      const barWidth = (count / Math.max(...pedidosData.map(([, c]) => c), 1)) * 60
      const barY = yChart + (index * 12)
      
      if (barY > this.pageHeight - 60) return

      this.doc.setFontSize(7)
      this.doc.text(`${status}: ${count}`, this.margin, barY + 1)
      
      const color = PDF_CONSTANTS.COLORS.GREEN
      this.doc.setFillColor(color[0], color[1], color[2])
      this.doc.rect(this.margin + 50, barY, barWidth, 8, 'F')
      this.doc.setDrawColor(0)
      this.doc.setLineWidth(0.2)
      this.doc.rect(this.margin + 50, barY, barWidth, 8)
    })
  }

  private generateInscricoesStatusCharts(
    statusInscricoes: Record<string, number>,
    resumoPorCampo: Record<string, number>,
    startY: number
  ) {
    // Status das inscrições
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Status das Inscrições', this.margin, startY)

    const inscricoesData = Object.entries(statusInscricoes) as [string, number][]
    let yChart = startY + 20

    inscricoesData.forEach(([status, count], index) => {
      const barWidth = (count / Math.max(...inscricoesData.map(([, c]) => c), 1)) * 60
      const barY = yChart + (index * 12)
      
      if (barY > this.pageHeight - 60) return

      this.doc.setFontSize(7)
      this.doc.text(`${status}: ${count}`, this.margin, barY + 1)
      
      const color = PDF_CONSTANTS.COLORS.PRIMARY
      this.doc.setFillColor(color[0], color[1], color[2])
      this.doc.rect(this.margin + 50, barY, barWidth, 8, 'F')
      this.doc.setDrawColor(0)
      this.doc.setLineWidth(0.2)
      this.doc.rect(this.margin + 50, barY, barWidth, 8)
    })

    // Distribuição por campo
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Distribuição por Campo', this.margin, yChart + 60)

    const camposData = Object.entries(resumoPorCampo) as [string, number][]
    yChart += 80

    camposData.forEach(([campo, count], index) => {
      const barWidth = (count / Math.max(...camposData.map(([, c]) => c), 1)) * 60
      const barY = yChart + (index * 12)
      
      if (barY > this.pageHeight - 60) return

      this.doc.setFontSize(7)
      this.doc.text(`${campo}: ${count}`, this.margin, barY + 1)
      
      const color = PDF_CONSTANTS.COLORS.BLUE
      this.doc.setFillColor(color[0], color[1], color[2])
      this.doc.rect(this.margin + 50, barY, barWidth, 8, 'F')
      this.doc.setDrawColor(0)
      this.doc.setLineWidth(0.2)
      this.doc.rect(this.margin + 50, barY, barWidth, 8)
    })
  }

  private generatePedidosStatusChart(statusData: Record<string, number>, startY: number) {
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Status dos Pedidos', this.margin, startY)

    const data = Object.entries(statusData) as [string, number][]
    let yChart = startY + 20

    data.forEach(([status, count], index) => {
      const barWidth = (count / Math.max(...data.map(([, c]) => c), 1)) * 60
      const barY = yChart + (index * 12)

      if (barY > this.pageHeight - 60) return

      this.doc.setFontSize(7)
      this.doc.text(`${status}: ${count}`, this.margin, barY + 1)

      const color = PDF_CONSTANTS.COLORS.GREEN
      this.doc.setFillColor(color[0], color[1], color[2])
      this.doc.rect(this.margin + 50, barY, barWidth, 8, 'F')
      this.doc.setDrawColor(0)
      this.doc.setLineWidth(0.2)
      this.doc.rect(this.margin + 50, barY, barWidth, 8)
    })
  }

  private generateCanalPieChart(canais: Record<string, number>, startY: number) {
    const total = Object.values(canais).reduce((a, b) => a + b, 0)
    const width = 120
    const height = 60
    const radius = 25
    const centerX = width / 2
    const centerY = height / 2

    // Cria canvas para desenho do gráfico
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let startAngle = 0
    const colors = [
      PDF_CONSTANTS.COLORS.PRIMARY,
      PDF_CONSTANTS.COLORS.BLUE,
      PDF_CONSTANTS.COLORS.YELLOW,
      PDF_CONSTANTS.COLORS.PURPLE,
    ]

    Object.entries(canais).forEach(([canal, valor], idx) => {
      const angle = (valor / Math.max(total, 1)) * Math.PI * 2
      const endAngle = startAngle + angle
      const color = colors[idx % colors.length]

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`
      ctx.fill()

      startAngle = endAngle
    })

    const imgData = canvas.toDataURL('image/png')
    this.doc.addImage(imgData, 'PNG', this.margin, startY, width, height)

    // Desenha legendas sobre o PDF
    startAngle = 0
    Object.entries(canais).forEach(([canal, valor]) => {
      const angle = (valor / Math.max(total, 1)) * Math.PI * 2
      const midAngle = startAngle + angle / 2
      const labelX = this.margin + centerX + (radius + 10) * Math.cos(midAngle)
      const labelY = startY + centerY + (radius + 10) * Math.sin(midAngle)

      this.doc.setFontSize(6)
      this.doc.text(`${canal} (${valor})`, labelX, labelY)

      startAngle += angle
    })
  }

  public addFooter(pageNumber: number, totalPages: number) {
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.FOOTER)
    this.doc.text(`Página ${pageNumber} de ${totalPages}`, this.pageWidth / 2, this.pageHeight - 20, { align: 'center' })
    this.doc.text('Desenvolvido por M24', this.pageWidth - this.margin, this.pageHeight - 20, { align: 'right' })
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
  generator.generatePedidosOverview(pedidos, produtos)
  generator.generateInscricoesOverview(inscricoes, produtos)
  generator.generateInscricoesTable(inscricoes, produtos)
  generator.generatePedidosTable(pedidos, produtos)

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