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
    this.doc.text('2. Tabelas de Análise', this.margin, 80)
    this.doc.text('3. Tabelas de Pedidos', this.margin, 100)
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

    // Preparar dados das tabelas de status com percentuais
    const inscrRows = Object.entries(statusInscricoes).map(([status, count]) => [
      status,
      count.toString(),
      `${((count / totalInscricoes) * 100).toFixed(1)}%`
    ])
    inscrRows.push(['Total', totalInscricoes.toString(), '100%'])

    const pedRows = Object.entries(statusPedidos).map(([status, count]) => [
      status,
      count.toString(),
      `${((count / totalPedidos) * 100).toFixed(1)}%`
    ])
    pedRows.push(['Total', totalPedidos.toString(), '100%'])

    // Tabela de Status Inscrições (lado esquerdo)
    autoTable(this.doc, {
      startY: cardStartY + cardHeight + 20,
      margin: { left: this.margin, right: this.pageWidth / 2 + 5 },
      head: [['Status', 'Qtd', '%']],
      body: inscrRows,
      theme: 'striped',
      headStyles: {
        fillColor: PDF_CONSTANTS.COLORS.HEADER_BG as [number, number, number],
        fontStyle: 'bold',
        halign: 'center',
      },
      styles: {
        fontSize: PDF_CONSTANTS.FONT_SIZES.TABLE_DATA,
        cellPadding: PDF_CONSTANTS.DIMENSIONS.CELL_PADDING,
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' }
      },
    })

    // Tabela de Status Pedidos (lado direito)
    autoTable(this.doc, {
      startY: cardStartY + cardHeight + 20,
      margin: { left: this.pageWidth / 2 + 5, right: this.margin },
      head: [['Status', 'Qtd', '%']],
      body: pedRows,
      theme: 'striped',
      headStyles: {
        fillColor: PDF_CONSTANTS.COLORS.HEADER_BG as [number, number, number],
        fontStyle: 'bold',
        halign: 'center',
      },
      styles: {
        fontSize: PDF_CONSTANTS.FONT_SIZES.TABLE_DATA,
        cellPadding: PDF_CONSTANTS.DIMENSIONS.CELL_PADDING,
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' }
      },
    })

    // Obter posição Y após as tabelas de status
    const lastAutoTable = (this.doc as any).lastAutoTable
    const statusTablesEndY = lastAutoTable ? lastAutoTable.finalY : cardStartY + cardHeight + 80

         // Tabela Analítica de Pedidos
     const analyticsStartY = statusTablesEndY + 20

     // Preparar dados analíticos de pedidos
     const pedAnalyticData = this.calculatePedidosAnalytics(pedidos, produtos)
     const pedAnalyticRows = pedAnalyticData.map(([campo, produto, tamanho, status, count, percentage]) => [
       campo,
       produto,
       tamanho,
       status,
       count.toString(),
       `${Number(percentage).toFixed(1)}%`
     ])

     // Tabela Analítica de Pedidos (largura total)
     this.doc.setFontSize(PDF_CONSTANTS.FONT_SIZES.HEADER)
     this.doc.setFont('helvetica', 'bold')
     this.doc.text('Análise de Pedidos', this.margin, analyticsStartY - 10)

     autoTable(this.doc, {
       startY: analyticsStartY,
       margin: { left: this.margin, right: this.margin },
       head: [['Campo', 'Produto', 'Tamanho', 'Status', 'Total', '% do Total']],
       body: pedAnalyticRows,
       theme: 'striped',
       headStyles: {
         fillColor: PDF_CONSTANTS.COLORS.HEADER_BG as [number, number, number],
         fontStyle: 'bold',
         halign: 'center',
       },
       styles: {
         fontSize: 9,
         cellPadding: 3,
         overflow: 'linebreak',
       },
       columnStyles: {
         0: { cellWidth: 25 },
         1: { cellWidth: 30 },
         2: { cellWidth: 20 },
         3: { cellWidth: 25 },
         4: { halign: 'right', cellWidth: 15 },
         5: { halign: 'right', cellWidth: 15 }
       },
     })
  }

     // Métodos auxiliares para calcular dados analíticos

  private calculatePedidosAnalytics(pedidos: Pedido[], produtos: Produto[]) {
    const analytics = new Map<string, [string, string, string, string, number, number]>()

    pedidos.forEach(pedido => {
      const campo = pedido.expand?.campo?.nome || 'N/A'
      // Tratar produto que pode ser string ou array
      const produtoId = Array.isArray(pedido.produto) ? pedido.produto[0] : pedido.produto
      const produto = getProdutoInfo(produtoId || '', produtos)
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

    // Calcular percentuais
    const total = pedidos.length
    const result = Array.from(analytics.values()).map(([campo, produto, tamanho, status, count]) =>
      [campo, produto, tamanho, status, count, (count / total) * 100]
    )

    return result.sort((a, b) => (b[4] as number) - (a[4] as number))
  }







  // Página 4 - Tabelas de Inscrições
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

    const orientation = 'landscape'
    this.doc.addPage('l')
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
      inscricao.nome || 'Não informado', formatCpf(inscricao.cpf || 'Não informado'), inscricao.expand?.evento?.titulo || 'Não informado',
      inscricao.expand?.campo?.nome || inscricao.campo || 'Não informado',
      getProdutoInfo(inscricao.produto || '', produtos),
      inscricao.status || 'Não informado',
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
        0: { cellWidth: 40, overflow: 'linebreak' },
        1: { cellWidth: 32, halign: 'right' },
        2: { cellWidth: 28, overflow: 'linebreak' },
        3: { cellWidth: 25 },
        4: { cellWidth: 30, overflow: 'linebreak' },
        5: { cellWidth: 22 },
      },
    })
  }

  // Página 5 - Tabelas de Pedidos
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

    const orientation = 'landscape'
    this.doc.addPage('l')
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
        5: { cellWidth: 24 },
        6: { cellWidth: 18 },
      },
    })
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