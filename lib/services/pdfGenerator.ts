import type { Inscricao, Pedido, Produto } from '@/types'
import type { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  PDF_CONSTANTS,
  formatCpf,
  calculateInscricoesStatus,
  calculatePedidosStatus,
  calculateResumoPorTamanho,
  calculateResumoPorCampo,
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
    totalPages: number
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

    this.addFooter(this.doc.getNumberOfPages(), totalPages)
  }

  // Página 2 - Sumário
  generateSummaryPage(totalPages: number) {
    this.doc.addPage()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Sumário', this.margin, 40)

    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('1. Resumo Executivo', this.margin, 60)
    this.doc.text('2. Panorama Geral - Pedidos', this.margin, 80)
    this.doc.text('3. Panorama Geral - Inscrições', this.margin, 100)
    this.doc.text('4. Tabelas de Análise', this.margin, 120)
    this.doc.text('5. Tabelas de Pedidos', this.margin, 140)

    this.addFooter(this.doc.getNumberOfPages(), totalPages)
  }

  // Página 3 - Resumo Executivo
  generateExecutiveSummary(
    inscricoes: Inscricao[],
    pedidos: Pedido[],
    valorTotal: number,
    totalPages: number
  ) {
    this.doc.addPage()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Resumo Executivo', this.margin, 40)

    const statusInscricoes = calculateInscricoesStatus(inscricoes)
    const statusPedidos = calculatePedidosStatus(pedidos)

    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Status das Inscrições:', this.margin, 70)
    let y = 90
    Object.entries(statusInscricoes).forEach(([status, count]) => {
      this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.TABLE_DATA)
      this.doc.text(`• ${status}: ${count}`, this.margin, y)
      y += 10
    })

    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Status dos Pedidos:', this.margin, y + 20)
    y += 40
    Object.entries(statusPedidos).forEach(([status, count]) => {
      this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.TABLE_DATA)
      this.doc.text(`• ${status}: ${count}`, this.margin, y)
      y += 10
    })

    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text(`Valor Total: R$ ${valorTotal.toFixed(2)}`, this.margin, y + 20)

    this.addFooter(this.doc.getNumberOfPages(), totalPages)
  }

  // Página 4 - Panorama Geral Pedidos
  generatePedidosOverview(
    pedidos: Pedido[],
    produtos: Produto[],
    totalPages: number
  ) {
    this.doc.addPage()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Panorama Geral', this.margin, 40)

    const resumoPorTamanho = calculateResumoPorTamanho(pedidos, produtos)
    const statusPedidos = calculatePedidosStatus(pedidos)

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
      didDrawPage: () => {
        this.addFooter(this.doc.getNumberOfPages(), totalPages)
      },
    })

    const lastY =
      (this.doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ??
      90

    // Gráficos
    this.generateCharts(resumoPorTamanho, statusPedidos, lastY + 20)

    this.addFooter(this.doc.getNumberOfPages(), totalPages)
  }

  // Página 5 - Panorama Geral Inscrições
  generateInscricoesOverview(
    inscricoes: Inscricao[],
    produtos: Produto[],
    totalPages: number
  ) {
    this.doc.addPage()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Panorama Geral - Inscrições', this.margin, 40)

    const resumoPorTamanhoInscricoes = this.calculateInscricoesPorTamanho(inscricoes, produtos)
    const statusInscricoes = calculateInscricoesStatus(inscricoes)
    const resumoPorCampo = calculateResumoPorCampo(inscricoes)

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
      didDrawPage: () => {
        this.addFooter(this.doc.getNumberOfPages(), totalPages)
      },
    })

    const lastYInscr =
      (this.doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ??
      90

    // Gráficos
    this.generateInscricoesCharts(
      resumoPorTamanhoInscricoes,
      statusInscricoes,
      resumoPorCampo,
      lastYInscr + 20,
    )

    this.addFooter(this.doc.getNumberOfPages(), totalPages)
  }

  // Página 6 - Tabelas de Inscrições
  generateInscricoesTable(inscricoes: Inscricao[], produtos: Produto[], totalPages: number) {
    this.doc.addPage()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Tabelas de Inscrições Detalhadas', this.margin, 40)

    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Inscrições Detalhadas', this.margin, 75)

    const headers = [
      'Nome',
      'Telefone',
      'CPF',
      'Email',
      'Evento',
      'Status',
      'Campo',
      'Produto',
      'Criado em',
    ]

    const rows = inscricoes.map(inscricao => [
      inscricao.nome || 'Não informado',
      inscricao.telefone || 'Não informado',
      formatCpf(inscricao.cpf || inscricao.id),
      inscricao.email || 'Não informado',
      getEventoNome(inscricao.produto || '', produtos),
      inscricao.status || 'Não informado',
      inscricao.campo || 'Não informado',
      getProdutoInfo(inscricao.produto || '', produtos),
      normalizeDate(inscricao.created),
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
        overflow: 'linebreak',
        minCellHeight: PDF_CONSTANTS.SPACING.TABLE_ROW_HEIGHT,
      },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      didDrawPage: data => {
        this.addFooter(this.doc.getNumberOfPages(), totalPages)
      },
    })
  }

  // Página 7 - Tabelas de Pedidos
  generatePedidosTable(pedidos: Pedido[], produtos: Produto[], totalPages: number) {
    this.doc.addPage()
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.SUBTITLE)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Tabelas de Pedidos', this.margin, 40)

    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
    this.doc.text('Pedidos Detalhados', this.margin, 75)

    const headers = [
      'Produto',
      'Nome',
      'CPF',
      'Email',
      'Tamanho',
      'Status',
      'Campo',
      'Canal',
      'Data',
    ]

    const rows = pedidos.map(pedido => [
      pedido.produto.map(prodId => getProdutoInfo(prodId, produtos)).join(', '),
      getNomeCliente(pedido),
      formatCpf(getCpfCliente(pedido)),
      pedido.email || 'Não informado',
      pedido.tamanho || 'Não informado',
      pedido.status || 'Não informado',
      pedido.expand?.campo?.nome || pedido.campo || 'Não informado',
      pedido.canal || 'Não informado',
      normalizeDate(pedido.created),
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
        overflow: 'linebreak',
        minCellHeight: PDF_CONSTANTS.SPACING.TABLE_ROW_HEIGHT,
      },
      columnStyles: { 2: { halign: 'right' } },
      didDrawPage: data => {
        this.addFooter(this.doc.getNumberOfPages(), totalPages)
      },
    })
  }

  private calculateInscricoesPorTamanho(inscricoes: Inscricao[], produtos: Produto[]) {
    return inscricoes.reduce((acc, inscricao) => {
      const tamanho = inscricao.tamanho || 'Sem tamanho'
      if (!acc[tamanho]) {
        acc[tamanho] = {
          quantidade: 0,
          produtos: new Set()
        }
      }
      acc[tamanho].quantidade += 1
      
      if (inscricao.produto) {
        const produto = produtos.find(p => p.id === inscricao.produto)
        if (produto) {
          acc[tamanho].produtos.add(produto.nome)
        }
      }
      return acc
    }, {} as Record<string, { quantidade: number; produtos: Set<string> }>)
  }

  private generateCharts(
    resumoPorTamanho: Record<string, { quantidade: number; produtos: Set<string> }>,
    statusPedidos: Record<string, number>,
    startY: number
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

    // Gráficos de status compactos
    this.generateStatusCharts(statusPedidos, yChart + 120)
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

  private addFooter(pageNumber: number, totalPages: number) {
    this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.FOOTER)
    this.doc.text(`Página ${pageNumber} de ${totalPages}`, this.pageWidth / 2, this.pageHeight - 20, { align: 'center' })
    this.doc.text('Desenvolvido por M24', this.pageWidth - this.margin, this.pageHeight - 20, { align: 'right' })
  }

  public calculateTotalPages(
    inscricoes: Inscricao[],
    pedidos: Pedido[],
    produtos: Produto[]
  ): number {
    const jsPDFConstructor = this.doc.constructor as typeof import('jspdf').jsPDF

    // Páginas fixas: Capa, Sumário, Resumo Executivo, Panorama Pedidos, Panorama Inscrições
    let totalPages = 5

    // ----------- Inscricoes Table -------------
    const tempDocInscricoes = new jsPDFConstructor({ format: 'a4', unit: 'mm' })
    const inscricoesHeaders = [
      'Nome',
      'Telefone',
      'CPF',
      'Email',
      'Evento',
      'Status',
      'Campo',
      'Produto',
      'Criado em',
    ]
    const inscricoesRows = inscricoes.map(inscricao => [
      inscricao.nome || 'Não informado',
      inscricao.telefone || 'Não informado',
      formatCpf(inscricao.cpf || inscricao.id),
      inscricao.email || 'Não informado',
      getEventoNome(inscricao.produto || '', produtos),
      inscricao.status || 'Não informado',
      inscricao.campo || 'Não informado',
      getProdutoInfo(inscricao.produto || '', produtos),
      normalizeDate(inscricao.created),
    ])
    autoTable(tempDocInscricoes, {
      startY: 100,
      head: [inscricoesHeaders],
      body: inscricoesRows,
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: PDF_CONSTANTS.FONT_SIZES.TABLE_DATA,
        cellPadding: PDF_CONSTANTS.DIMENSIONS.CELL_PADDING,
        overflow: 'linebreak',
        minCellHeight: PDF_CONSTANTS.SPACING.TABLE_ROW_HEIGHT,
      },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    })
    totalPages += tempDocInscricoes.getNumberOfPages()

    // ----------- Pedidos Table -------------
    const tempDocPedidos = new jsPDFConstructor({ format: 'a4', unit: 'mm' })
    const pedidosHeaders = [
      'Produto',
      'Nome',
      'CPF',
      'Email',
      'Tamanho',
      'Status',
      'Campo',
      'Canal',
      'Data',
    ]
    const pedidosRows = pedidos.map(pedido => [
      pedido.produto.map(prodId => getProdutoInfo(prodId, produtos)).join(', '),
      getNomeCliente(pedido),
      formatCpf(getCpfCliente(pedido)),
      pedido.email || 'Não informado',
      pedido.tamanho || 'Não informado',
      pedido.status || 'Não informado',
      pedido.expand?.campo?.nome || pedido.campo || 'Não informado',
      pedido.canal || 'Não informado',
      normalizeDate(pedido.created),
    ])
    autoTable(tempDocPedidos, {
      startY: 100,
      head: [pedidosHeaders],
      body: pedidosRows,
      theme: 'grid',
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: PDF_CONSTANTS.FONT_SIZES.TABLE_DATA,
        cellPadding: PDF_CONSTANTS.DIMENSIONS.CELL_PADDING,
        overflow: 'linebreak',
        minCellHeight: PDF_CONSTANTS.SPACING.TABLE_ROW_HEIGHT,
      },
      columnStyles: { 2: { halign: 'right' } },
    })
    totalPages += tempDocPedidos.getNumberOfPages()

    return totalPages
  }
}

export async function generatePDF(
  inscricoes: Inscricao[],
  pedidos: Pedido[],
  produtos: Produto[],
  valorTotal: number
) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const generator = new PDFGenerator(doc)

  // Determinar o contexto
  const isRelatorios = window.location.pathname.includes('/relatorios')
  const urlParams = new URLSearchParams(window.location.search)
  const eventoFiltro = urlParams.get('evento')
  const eventoSelecionado = eventoFiltro && eventoFiltro !== 'todos' ? eventoFiltro : null

  // Calcular número total de páginas
  const totalPages = generator.calculateTotalPages(inscricoes, pedidos, produtos)

  // Gerar páginas
  generator.generateCoverPage(isRelatorios, eventoSelecionado, totalPages)
  generator.generateSummaryPage(totalPages)
  generator.generateExecutiveSummary(inscricoes, pedidos, valorTotal, totalPages)
  generator.generatePedidosOverview(pedidos, produtos, totalPages)
  generator.generateInscricoesOverview(inscricoes, produtos, totalPages)
  generator.generateInscricoesTable(inscricoes, produtos, totalPages)
  generator.generatePedidosTable(pedidos, produtos, totalPages)

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