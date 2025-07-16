'use client'

import LayoutWrapperAdmin from '@/components/templates/LayoutWrapperAdmin'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { generateRelatorioPdf } from '@/lib/report/generateRelatorioPdf'
import { generateAnalisePdf } from '@/lib/report/generateAnalisePdf'
import { useToast } from '@/lib/context/ToastContext'
import { useEffect, useState, useRef } from 'react'
import type { Pedido, Produto } from '@/types'
import { fetchAllPages } from '@/lib/utils/fetchAllPages'
import dynamic from 'next/dynamic'
import { setupCharts } from '@/lib/chartSetup'
import twColors from '@/utils/twColors'
import colors from 'tailwindcss/colors'
import type { Chart, ChartData } from 'chart.js'

const BarChart = dynamic(() => import('react-chartjs-2').then((m) => m.Bar), {
  ssr: false,
})

export default function RelatorioPage() {
  const { user, authChecked } = useAuthGuard(['coordenador', 'lider'])
  const { showError, showSuccess } = useToast()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [analysis, setAnalysis] = useState<'produtoCampo' | 'produtoCanalCampo'>(
    'produtoCampo',
  )
  const [statusFilter, setStatusFilter] = useState('todos')
  const [rows, setRows] = useState<(string | number)[][]>([])
  const [chartData, setChartData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  })
  const chartRef = useRef<Chart<'bar'> | null>(null)

  useEffect(() => {
    setupCharts()
  }, [])

  useEffect(() => {
    if (!authChecked || !user) return
    const controller = new AbortController()
    const signal = controller.signal
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          page: '1',
          perPage: '50',
          expand: 'campo,produto',
        })
        const baseUrl = `/api/pedidos?${params.toString()}`
        const res = await fetch(baseUrl, { credentials: 'include', signal })
        if (!res.ok) throw new Error('Erro ao obter pedidos')
        const data = await res.json()
        const rest = await fetchAllPages<
          { items?: Pedido[] } | Pedido
        >(baseUrl, data.totalPages ?? 1, signal)
        let lista: Pedido[] = Array.isArray(data.items)
          ? (data.items as Pedido[])
          : (data as Pedido[])
        lista = lista.concat(
          rest.flatMap((r) =>
            Array.isArray((r as { items?: Pedido[] }).items)
              ? ((r as { items: Pedido[] }).items)
              : (r as Pedido),
          ),
        )
        if (user.role === 'lider') {
          lista = lista.filter((p: Pedido) => p.expand?.campo?.id === user.campo)
        }
        setPedidos(lista)
      } catch (err) {
        console.error('Erro ao carregar pedidos', err)
        showError('Erro ao carregar pedidos')
      }
    }
    fetchData()
    return () => controller.abort()
  }, [authChecked, user, showError])

  useEffect(() => {
    const filtered =
      statusFilter === 'todos'
        ? pedidos
        : pedidos.filter((p) => p.status === statusFilter)
    const rowsCalc: (string | number)[][] = []
    let labels: string[] = []
    let datasets: ChartData<'bar'>['datasets'] = []

    if (analysis === 'produtoCampo') {
      const count: Record<string, Record<string, number>> = {}
      filtered.forEach((p) => {
        const campo = p.expand?.campo?.nome || 'Sem campo'
        const produtosData = Array.isArray(p.expand?.produto)
          ? (p.expand?.produto as Produto[])
          : p.expand?.produto
            ? [(p.expand.produto as Produto)]
            : []
        if (produtosData.length === 0) {
          count[campo] = count[campo] || {}
          count[campo]['Sem produto'] = (count[campo]['Sem produto'] || 0) + 1
        } else {
          produtosData.forEach((pr: Produto) => {
            const nome = pr?.nome || 'Sem produto'
            count[campo] = count[campo] || {}
            count[campo][nome] = (count[campo][nome] || 0) + 1
          })
        }
      })
      labels = Object.keys(count)
      const produtos = Array.from(
        new Set(labels.flatMap((c) => Object.keys(count[c])))
      )
      const palette = [
        twColors.primary600,
        twColors.error600,
        twColors.blue500,
        colors.emerald[500],
        colors.amber[500],
        colors.violet[500],
      ]
      datasets = produtos.map((prod, idx) => {
        labels.forEach((campo) => {
          const total = count[campo][prod]
          if (total !== undefined) rowsCalc.push([campo, prod, total])
        })
        return {
          label: prod,
          data: labels.map((c) => count[c][prod] || 0),
          backgroundColor: palette[idx % palette.length],
          stack: 'stack',
        }
      })
    } else {
      const count: Record<string, Record<string, Record<string, number>>> = {}
      filtered.forEach((p) => {
        const campo = p.expand?.campo?.nome || 'Sem campo'
        const canal = p.canal || 'indefinido'
        const produtosData = Array.isArray(p.expand?.produto)
          ? (p.expand?.produto as Produto[])
          : p.expand?.produto
            ? [(p.expand.produto as Produto)]
            : []
        if (produtosData.length === 0) {
          count[campo] = count[campo] || {}
          count[campo]['Sem produto'] = count[campo]['Sem produto'] || {}
          count[campo]['Sem produto'][canal] =
            (count[campo]['Sem produto'][canal] || 0) + 1
        } else {
          produtosData.forEach((pr: Produto) => {
            const nome = pr?.nome || 'Sem produto'
            count[campo] = count[campo] || {}
            count[campo][nome] = count[campo][nome] || {}
            count[campo][nome][canal] =
              (count[campo][nome][canal] || 0) + 1
          })
        }
      })
      labels = Object.keys(count)
      const combos = Array.from(
        new Set(
          labels.flatMap((c) =>
            Object.keys(count[c]).flatMap((prod) =>
              Object.keys(count[c][prod]).map((canal) => `${prod} (${canal})`),
            ),
          ),
        ),
      )
      const palette = [
        twColors.primary600,
        twColors.error600,
        twColors.blue500,
        colors.emerald[500],
        colors.amber[500],
        colors.violet[500],
      ]
      datasets = combos.map((combo, idx) => {
        const match = combo.match(/^(.*) \((.*)\)$/)
        const prod = match?.[1] || ''
        const canal = match?.[2] || ''
        labels.forEach((campo) => {
          const total = count[campo][prod]?.[canal]
          if (total !== undefined) rowsCalc.push([campo, prod, canal, total])
        })
        return {
          label: combo,
          data: labels.map((c) => count[c][prod]?.[canal] || 0),
          backgroundColor: palette[idx % palette.length],
          stack: prod,
        }
      })
    }

    setRows(rowsCalc)
    setChartData({ labels, datasets })
  }, [analysis, pedidos, statusFilter])

  const handleDownload = async () => {
    try {
      await generateRelatorioPdf()
      showSuccess('PDF gerado com sucesso.')
    } catch (err) {
      console.error('Erro ao gerar PDF', err)
      const message =
        err instanceof Error && err.message.includes('Tempo')
          ? 'Tempo esgotado ao gerar PDF.'
          : 'Não foi possível gerar o PDF. Tente novamente.'
      showError(message)
    }
  }

  return (
    <LayoutWrapperAdmin>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <h1 className="text-3xl font-bold">Relatório</h1>

        <button onClick={handleDownload} className="btn btn-primary px-3 py-1">
          Baixar Regras (PDF)
        </button>

        <section>
          <h2 className="text-2xl font-semibold mt-4">Análises</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <select
              value={analysis}
              onChange={(e) =>
                setAnalysis(
                  e.target.value as 'produtoCampo' | 'produtoCanalCampo',
                )
              }
              className="border rounded px-2 py-1"
            >
              <option value="produtoCampo">Produto x Campo</option>
              <option value="produtoCanalCampo">Produto x Canal x Campo</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="todos">Todos</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="vencido">Vencido</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <button
              onClick={async () => {
                try {
                  const detailRows = pedidos.map((p) => [
                    Array.isArray(p.expand?.produto)
                      ? p.expand.produto
                          .map((prod: Produto) => prod.nome)
                          .join(', ')
                      : (p.expand?.produto as Produto | undefined)?.nome ||
                        (Array.isArray(p.produto)
                          ? p.produto.join(', ')
                          : p.produto ?? ''),
                    p.expand?.id_inscricao?.nome || '',
                    p.tamanho || '',
                    p.expand?.campo?.nome || '',
                    (p as unknown as { formaPagamento?: string }).formaPagamento ||
                      '',
                    p.created?.split('T')[0] || '',
                  ])

                  await generateAnalisePdf(
                    analysis === 'produtoCampo'
                      ? 'Análise Produto x Campo'
                      : 'Análise Produto x Canal x Campo',
                    analysis === 'produtoCampo'
                      ? ['Campo', 'Produto', 'Total']
                      : ['Campo', 'Produto', 'Canal', 'Total'],
                    rows,
                    detailRows,
                    chartRef.current?.toBase64Image(),
                  )
                  showSuccess('PDF gerado com sucesso.')
                } catch (err) {
                  console.error('Erro ao gerar PDF', err)
                  const message =
                    err instanceof Error && err.message.includes('Tempo')
                      ? 'Tempo esgotado ao gerar PDF.'
                      : 'Não foi possível gerar o PDF. Tente novamente.'
                  showError(message)
                }
              }}
              className="btn btn-primary px-3 py-1"
            >
              Gerar PDF
            </button>
          </div>
          <div className="mt-4 aspect-video">
            <BarChart
              ref={chartRef}
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { stacked: true }, y: { stacked: true } },
              }}
            />
          </div>
        </section>
      </div>
    </LayoutWrapperAdmin>
  )
}
