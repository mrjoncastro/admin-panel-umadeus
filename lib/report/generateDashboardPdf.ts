import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import template from './template.md'

export interface DashboardMetrics {
  labels: string[]
  inscricoes: number[]
  pedidos: number[]
  mediaValor: number
  arrecadacao: Record<string, number>
}

export interface Periodo {
  start?: string
  end?: string
}

export interface ChartImages {
  inscricoes?: string
  pedidos?: string
  campoProduto?: string
  arrecadacao?: string
}

function formatPeriod({ start, end }: Periodo) {
  const startText = start ? new Date(start).toLocaleDateString('pt-BR') : ''
  const endText = end ? new Date(end).toLocaleDateString('pt-BR') : ''
  return `${startText} – ${endText}`
}

export async function generateDashboardPdf(
  metrics: DashboardMetrics,
  periodo: Periodo,
  charts: ChartImages = {},
) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Tempo esgotado ao gerar PDF.'))
    }, 10_000)

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })

      const content = template.split('\n').filter(Boolean)
      const title = content[0].replace(/^#\s*/, '')
      const periodLine = content[1].replace('{{period}}', formatPeriod(periodo))
      const footer = content[2]

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' })
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(periodLine, doc.internal.pageSize.getWidth() - 40, 60, { align: 'right' })

      const rows = metrics.labels.map((d, idx) => [
        d,
        metrics.inscricoes[idx] || 0,
        metrics.pedidos[idx] || 0,
      ])

      autoTable(doc, {
        startY: 80,
        head: [['Data', 'Inscrições', 'Pedidos']],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [217, 217, 217], halign: 'center' },
        styles: { fontSize: 10 },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
        margin: { left: 40, right: 40 },
      })

      let y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 80
      y += 20

      if (charts.inscricoes) {
        doc.addImage(charts.inscricoes, 'PNG', 40, y, 520, 220)
        y += 240
      }

      if (charts.pedidos) {
        doc.addImage(charts.pedidos, 'PNG', 40, y, 520, 220)
        y += 240
      }

      if (charts.campoProduto) {
        doc.addImage(charts.campoProduto, 'PNG', 40, y, 520, 220)
        y += 240
      }

      if (charts.arrecadacao) {
        doc.addImage(charts.arrecadacao, 'PNG', 40, y, 520, 220)
        y += 240
      }

      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        const pageHeight = doc.internal.pageSize.getHeight()
        doc.setFontSize(10)
        doc.text(footer, 40, pageHeight - 20)
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() - 40,
          pageHeight - 20,
          { align: 'right' },
        )
      }

      doc.save('dashboard.pdf')
      clearTimeout(timeout)
      resolve()
    } catch (err) {
      clearTimeout(timeout)
      reject(err)
    }
  })
}
