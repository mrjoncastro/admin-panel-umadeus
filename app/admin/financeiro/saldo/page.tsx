'use client'

import { useAuthContext } from '@/lib/context/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveAs } from 'file-saver'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { DateRangePicker } from '@/components/molecules'

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

  const exportXLSM = () => {
    const worksheet = XLSX.utils.json_to_sheet(extrato)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Extrato')
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, 'extrato.xlsm')
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text('Extrato', 10, 10)
    extrato.forEach((t, i) => {
      doc.text(
        `${t.date} - ${t.description} - R$ ${t.value.toFixed(2)}`,
        10,
        20 + i * 10,
      )
    })
    doc.save('extrato.pdf')
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
