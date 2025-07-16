import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function generateAnalisePdf(
  title: string,
  headers: string[],
  rows: (string | number)[][],
) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Tempo esgotado ao gerar PDF.'))
    }, 5000)

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, {
        align: 'center',
      })

      autoTable(doc, {
        startY: 60,
        head: [headers],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [217, 217, 217], halign: 'center' },
        styles: { fontSize: 10 },
        margin: { left: 40, right: 40 },
      })

      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() - 40,
          doc.internal.pageSize.getHeight() - 20,
          { align: 'right' },
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
