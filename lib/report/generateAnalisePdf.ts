import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  PDF_MARGINS,
  FONT_SIZE_TITLE,
  FONT_SIZE_FOOTER,
} from './constants'

export async function generateAnalisePdf(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  details?: (string | number)[][],
  chart?: string,
  totals?: Record<string, number>,
) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Tempo esgotado ao gerar PDF.'))
    }, 5000)

    try {
      const margin = PDF_MARGINS
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const contentWidth = pageWidth - margin.left - margin.right
      doc.setFontSize(FONT_SIZE_TITLE)
      doc.setFont('helvetica', 'bold')
      doc.text(title, pageWidth / 2, margin.top, {
        align: 'center',
      })

      let y = margin.top + 20
      if (chart) {
        doc.addImage(chart, 'PNG', margin.left, y, contentWidth, 220)
        y += 240
      }

      autoTable(doc, {
        startY: y,
        head: [headers],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [217, 217, 217], halign: 'center' },
        styles: { fontSize: 10 },
        margin,
      })

      if (totals && Object.keys(totals).length > 0) {
        const totalRows = Object.entries(totals).map(([prod, total]) => [prod, total])
        const lastTableY = (
          doc as unknown as { lastAutoTable?: { finalY?: number } }
        ).lastAutoTable?.finalY ?? y
        autoTable(doc, {
          startY: lastTableY + 20,
          head: [['Produto', 'Total']],
          body: totalRows,
          theme: 'striped',
          headStyles: { fillColor: [217, 217, 217], halign: 'center' },
          styles: { fontSize: 10 },
          margin,
        })
      }

      if (details && details.length > 0) {
        doc.addPage()
        autoTable(doc, {
          startY: margin.top,
          head: [
            [
              'Produto',
              'Nome',
              'Tamanho',
              'Campo',
              'Forma de pagamento',
              'Data',
            ],
          ],
          body: details,
          theme: 'striped',
          headStyles: { fillColor: [217, 217, 217], halign: 'center' },
          styles: { fontSize: 8 },
          margin,
        })
      }

      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        const pageHeight = doc.internal.pageSize.getHeight()
        doc.setFontSize(FONT_SIZE_FOOTER)

        const date = new Date().toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        })
        doc.text(date, pageWidth - margin.right, pageHeight - 20, {
          align: 'right',
        })

        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 20,
          { align: 'center' },
        )
      }

      doc.save('analise.pdf')
      clearTimeout(timeout)
      resolve()
    } catch (err) {
      clearTimeout(timeout)
      reject(err)
    }
  })
}
