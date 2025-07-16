import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, {
        align: 'center',
      })

      let y = 60
      if (chart) {
        doc.addImage(chart, 'PNG', 40, y, 520, 220)
        y += 240
      }

      autoTable(doc, {
        startY: y,
        head: [headers],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [217, 217, 217], halign: 'center' },
        styles: { fontSize: 10 },
        margin: { left: 40, right: 40 },
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
          margin: { left: 40, right: 40 },
        })
      }

      if (details && details.length > 0) {
        doc.addPage()
        autoTable(doc, {
          startY: 40,
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
          margin: { left: 20, right: 20 },
        })
      }

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
