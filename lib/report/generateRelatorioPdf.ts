import jsPDF from 'jspdf'
import template from './templateRelatorio.md'

export async function generateRelatorioPdf() {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Tempo esgotado ao gerar PDF.'))
    }, 5000)

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const lines = template.split('\n')
      const title = lines[0].replace(/^#\s*/, '')
      const body = lines.slice(1)

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' })

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')

      let y = 70
      body.forEach((line) => {
        if (!line.trim()) {
          y += 12
          return
        }
        const splitted = doc.splitTextToSize(line, doc.internal.pageSize.getWidth() - 80)
        doc.text(splitted, 40, y)
        y += splitted.length * 12 + 8
      })

      const pages = doc.getNumberOfPages()
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i)
        const pageHeight = doc.internal.pageSize.getHeight()
        doc.setFontSize(10)

        const date = new Date().toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        })
        doc.text(date, doc.internal.pageSize.getWidth() - 40, pageHeight - 20, {
          align: 'right',
        })

        doc.text(
          `Página ${i} de ${pages}`,
          doc.internal.pageSize.getWidth() / 2,
          pageHeight - 20,
          { align: 'center' },
        )
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
