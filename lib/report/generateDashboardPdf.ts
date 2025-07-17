import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import template from './template.md'

async function toGrayscale(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < data.data.length; i += 4) {
        const r = data.data[i]
        const g = data.data[i + 1]
        const b = data.data[i + 2]
        const gray = r * 0.3 + g * 0.59 + b * 0.11
        data.data[i] = gray
        data.data[i + 1] = gray
        data.data[i + 2] = gray
      }
      ctx.putImageData(data, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.src = src
  })
}

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
  return new Promise<void>(async (resolve, reject) => {
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
        const img = await toGrayscale(charts.inscricoes)
        doc.addImage(img, 'PNG', 40, y, 520, 220)
        y += 240
      }

      if (charts.pedidos) {
        const img = await toGrayscale(charts.pedidos)
        doc.addImage(img, 'PNG', 40, y, 520, 220)
        y += 240
      }

      if (charts.campoProduto) {
        const img = await toGrayscale(charts.campoProduto)
        doc.addImage(img, 'PNG', 40, y, 520, 220)
        y += 240
      }

      if (charts.arrecadacao) {
        const img = await toGrayscale(charts.arrecadacao)
        doc.addImage(img, 'PNG', 40, y, 520, 220)
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
