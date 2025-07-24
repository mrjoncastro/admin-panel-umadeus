'use client'

import { useAuthContext } from '@/lib/context/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveAs } from 'file-saver'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  PDF_MARGINS,
  FONT_SIZE_TITLE,
  FONT_SIZE_BODY,
  FONT_SIZE_FOOTER,
} from '@/lib/report/constants'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { DateRangePicker } from '@/components/molecules'
import { useTenant } from '@/lib/context/TenantContext'

interface Statistics {
  netValue: number
}

interface ExtratoItem {
  id: string
  description: string
  value: number
  type: string
  date: string
}

export default function SaldoPage() {
  const { isLoggedIn } = useAuthContext()
  const router = useRouter()
  const { authChecked } = useAuthGuard(['coordenador', 'lider'])
  const [saldoDisponivel, setSaldoDisponivel] = useState<number | null>(null)
  const [aLiberar, setALiberar] = useState<number | null>(null)
  const [extrato, setExtrato] = useState<ExtratoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState({ start: '', end: '' })
  const { config } = useTenant()

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn) {
      router.replace('/login')
      return
    }
    const fetchData = async () => {
      try {
        setLoading(true)
        const saldoRes = await fetch('/admin/api/asaas/saldo')
        if (saldoRes.ok) {
          const data: { balance: number } = await saldoRes.json()
          setSaldoDisponivel(data.balance)
        }
        const statsRes = await fetch(
          '/admin/api/asaas/estatisticas?status=PENDING',
        )
        if (statsRes.ok) {
          const stats: Statistics = await statsRes.json()
          setALiberar(stats.netValue)
        }
        const params = new URLSearchParams()
        if (range.start) params.append('start', range.start)
        if (range.end) params.append('end', range.end)
        const extratoRes = await fetch(
          `/admin/api/asaas/extrato?${params.toString()}`,
        )
        if (extratoRes.ok) {
          const data = await extratoRes.json()
          setExtrato(data.data || [])
        }
      } catch (err) {
        console.error('Erro ao obter dados:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isLoggedIn, router, authChecked, range.start, range.end])

  const arrayBufferToBase64 = (buffer: ArrayBuffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buffer)))

  const exportXLSM = async () => {
    const worksheet = XLSX.utils.aoa_to_sheet([])
    worksheet['!cols'] = [{ wch: 12 }, { wch: 50 }, { wch: 12 }]

    const header = ['Logo', 'Data', 'Descrição', 'Valor (R$)']
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' })
    header.forEach((_, idx) => {
      const cell = worksheet[XLSX.utils.encode_cell({ c: idx, r: 0 })]
      if (cell) {
        cell.s = {
          font: { bold: true },
          alignment: { horizontal: 'center' },
          fill: { patternType: 'solid', fgColor: { rgb: 'D9D9D9' } },
        }
      }
    })

    const startText = range.start
      ? new Date(range.start).toLocaleDateString('pt-BR')
      : ''
    const endText = range.end
      ? new Date(range.end).toLocaleDateString('pt-BR')
      : ''
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [[`Período: ${startText} – ${endText}`]],
      { origin: 'B2' },
    )

    const rows = extrato.map((item) => [
      new Date(item.date).toLocaleDateString('pt-BR'),
      item.description,
      item.value.toFixed(2),
    ])
    XLSX.utils.sheet_add_aoa(worksheet, rows, { origin: 'B3' })

    const footerRow = rows.length + 3
    XLSX.utils.sheet_add_aoa(worksheet, [['Desenvolvido por M24 Tecnologia']], {
      origin: `B${footerRow}`,
    })

    try {
      if (config.logoUrl) {
        let base64: string
        if (config.logoUrl.startsWith('data:')) {
          base64 = config.logoUrl.split(',')[1]
        } else {
          const resp = await fetch(config.logoUrl)
          const buf = await resp.arrayBuffer()
          base64 = arrayBufferToBase64(buf)
        }

        ;(worksheet as XLSX.WorkSheet & { '!images'?: unknown[] })['!images'] =
          [
            {
              name: 'logo',
              data: base64,
              opts: { base64: true, origin: 'A1' },
            },
          ]
      }
    } catch (err) {
      console.error('Erro ao carregar logo', err)
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Extrato')
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, `extrato_${range.start}_${range.end}.xlsx`)
  }

  const exportPDF = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })

    let imgData: string | undefined
    try {
      if (config.logoUrl) {
        if (config.logoUrl.startsWith('data:')) {
          imgData = config.logoUrl.split(',')[1]
        } else {
          const resp = await fetch(config.logoUrl)
          const buf = await resp.arrayBuffer()
          imgData = arrayBufferToBase64(buf)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar logo', err)
    }

    if (imgData) {
      doc.addImage(
        imgData,
        'PNG',
        PDF_MARGINS.left,
        PDF_MARGINS.top - 16,
        60,
        30,
      )
    }

    doc.setFontSize(FONT_SIZE_TITLE)
    doc.setFont('helvetica', 'bold')
    doc.text(
      'Extrato de Movimentações',
      doc.internal.pageSize.getWidth() / 2,
      PDF_MARGINS.top,
      {
        align: 'center',
      },
    )
    doc.setFontSize(FONT_SIZE_BODY)
    doc.setFont('helvetica', 'normal')

    const startText = range.start
      ? new Date(range.start).toLocaleDateString('pt-BR')
      : ''
    const endText = range.end
      ? new Date(range.end).toLocaleDateString('pt-BR')
      : ''
    const period = `Período: ${startText} – ${endText}`
    doc.text(
      period,
      doc.internal.pageSize.getWidth() - PDF_MARGINS.right,
      PDF_MARGINS.top + 20,
      {
        align: 'right',
      },
    )

    const rows = extrato.map((item) => [
      new Date(item.date).toLocaleDateString('pt-BR'),
      item.description,
      item.value.toFixed(2),
    ])

    autoTable(doc, {
      startY: PDF_MARGINS.top + 40,
      head: [['Data', 'Descrição', 'Valor (R$)']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [217, 217, 217], halign: 'center' },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 340 },
        2: { cellWidth: 80, halign: 'right' },
      },
      margin: { left: PDF_MARGINS.left, right: PDF_MARGINS.right },
    })

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(FONT_SIZE_FOOTER)
      doc.text(
        'Desenvolvido por M24 Tecnologia',
        PDF_MARGINS.left,
        pageHeight - 20,
      )
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() - PDF_MARGINS.right,
        pageHeight - 20,
        { align: 'right' },
      )
    }

    doc.save(`extrato_${range.start}_${range.end}.pdf`)
  }

  if (!authChecked) return null

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="heading mb-6">Saldo</h2>
      {loading ? (
        <LoadingOverlay show={true} text="Carregando..." />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Saldo Disponível</h3>
              <p className="text-xl font-bold">
                {typeof saldoDisponivel === 'number'
                  ? `R$ ${saldoDisponivel.toFixed(2)}`
                  : '—'}
              </p>
            </div>
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">A Liberar</h3>
              <p className="text-xl font-bold">
                {typeof aLiberar === 'number'
                  ? `R$ ${aLiberar.toFixed(2)}`
                  : '—'}
              </p>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="heading">Extrato</h3>
            <DateRangePicker
              start={range.start}
              end={range.end}
              onChange={setRange}
              className="mb-4"
            />
            <div className="overflow-x-auto rounded border shadow-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
              <table className="table-base">
                <thead>
                  <tr className="text-left">
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {extrato.map((t) => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.description}</td>
                      <td>
                        {typeof t.value === 'number' ? t.value.toFixed(2) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={exportPDF} className="btn btn-secondary">
                Exportar PDF
              </button>
              <button onClick={exportXLSM} className="btn btn-secondary">
                Exportar XLSM
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
