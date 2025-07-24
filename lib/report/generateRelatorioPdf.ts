import jsPDF from 'jspdf'
import template from './templateRelatorio.md'
import {
  PDF_MARGINS,
  FONT_SIZE_TITLE,
  FONT_SIZE_BODY,
  FONT_SIZE_FOOTER,
} from './constants'

export async function generateRelatorioPdf() {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Tempo esgotado ao gerar PDF.'))
    }, 5000)

    try {
      const margin = PDF_MARGINS
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const contentWidth = pageWidth - margin.left - margin.right
      const lines = template.split('\n')
      const title = lines[0].replace(/^#\s*/, '')
      const body = lines.slice(1)

      doc.setFontSize(FONT_SIZE_TITLE)
      doc.setFont('helvetica', 'bold')
      doc.text(title, pageWidth / 2, margin.top, { align: 'center' })

      doc.setFontSize(FONT_SIZE_BODY)
      doc.setFont('helvetica', 'normal')

      let y = margin.top + 30
      body.forEach((line) => {
        if (!line.trim()) {
          y += 12
          return
        }
        const splitted = doc.splitTextToSize(line, contentWidth)
        doc.text(splitted, margin.left, y)
        y += splitted.length * 12 + 8
      })

      const pages = doc.getNumberOfPages()
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i)
        const pageHeight = doc.internal.pageSize.getHeight()
        doc.setFontSize(FONT_SIZE_FOOTER)

        const date = new Date().toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        })
        doc.text(date, pageWidth - margin.right, pageHeight - 20, {
          align: 'right',
        })

        doc.text(`Página ${i} de ${pages}`, pageWidth / 2, pageHeight - 20, {
          align: 'center',
        })
      }

      doc.save('relatorio.pdf')
      clearTimeout(timeout)
      resolve()
    } catch (err) {
      clearTimeout(timeout)
      reject(err)
    }
  })
}
