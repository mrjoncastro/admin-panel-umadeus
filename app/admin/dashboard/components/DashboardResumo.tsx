'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { setupCharts } from '@/lib/chartSetup'
import twColors from '@/utils/twColors'
import colors from 'tailwindcss/colors'
import { Info, Download, FileSpreadsheet } from 'lucide-react'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import type { Inscricao, Pedido, Produto } from '@/types'
import {
  exportToExcel,
  exportInscricoesToExcel,
  exportPedidosToExcel,
} from '@/lib/utils/excelExport'

const Bar = dynamic(() => import('react-chartjs-2').then((m) => m.Bar), {
  ssr: false,
})

interface DashboardResumoProps {
  inscricoes: Inscricao[]
  pedidos: Pedido[]
  filtroStatus: string
  filtroInscricoes: string
  setFiltroInscricoes: (status: string) => void
  setFiltroStatus: (status: string) => void
  totalInscricoes: number
  totalPedidos: number
}

export default function DashboardResumo({
  inscricoes,
  pedidos,
  filtroStatus,
  filtroInscricoes,
  setFiltroInscricoes,
  setFiltroStatus,
  totalInscricoes,
  totalPedidos,
}: DashboardResumoProps) {
  useEffect(() => {
    setupCharts()
  }, [])

  const valorTotalConfirmado = inscricoes.reduce((total, i) => {
    const pedido = i.expand?.pedido
    const confirmado =
      i.status === 'confirmado' || i.confirmado_por_lider === true
    const pago = pedido?.status === 'pago'
    const valor = Number(pedido?.valor ?? 0)

    if (confirmado && pago && !isNaN(valor)) {
      return total + valor
    }

    return total
  }, 0)

  const handleExportComplete = () => {
    exportToExcel({
      inscricoes,
      pedidos,
      totalInscricoes,
      totalPedidos,
      valorTotal: valorTotalConfirmado,
    })
  }

  const handleExportInscricoes = () => {
    exportInscricoesToExcel(inscricoes)
  }

  const handleExportPedidos = () => {
    exportPedidosToExcel(pedidos)
  }

  const statusInscricoes = inscricoes.reduce<Record<string, number>>(
    (acc, i) => {
      if (i.status) {
        acc[i.status] = (acc[i.status] || 0) + 1
      }
      return acc
    },
    {},
  )

  const statusPedidos = pedidos.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  const inscricoesFiltradas = inscricoes.filter(
    (i) => filtroInscricoes === 'todos' || i.status === filtroInscricoes,
  )

  const contagemInscricoes = inscricoesFiltradas.reduce<Record<string, number>>(
    (acc, i) => {
      const campo = i.expand?.campo?.nome || 'Sem campo'
      acc[campo] = (acc[campo] || 0) + 1
      return acc
    },
    {},
  )

  const inscricoesChart = {
    labels: Object.keys(contagemInscricoes),
    datasets: [
      {
        label: 'Inscrições',
        data: Object.values(contagemInscricoes),
        backgroundColor: twColors.primary600,
      },
    ],
  }

  const pedidosChart = (() => {
    const filtrados = pedidos.filter((p) => p.status === filtroStatus)
    const contagem = filtrados.reduce<Record<string, number>>((acc, p) => {
      const campo = p.expand?.campo?.nome || 'Sem campo'
      acc[campo] = (acc[campo] || 0) + 1
      return acc
    }, {})
    return {
      labels: Object.keys(contagem),
      datasets: [
        {
          label: `Pedidos (${filtroStatus})`,
          data: Object.values(contagem),
          backgroundColor: [
            twColors.primary600,
            twColors.error600,
            twColors.blue500,
          ],
        },
      ],
    }
  })()

  const pedidosCampoProdutoChart = (() => {
    const contagem: Record<string, Record<string, number>> = {}
    pedidos.forEach((p) => {
      const campo = p.expand?.campo?.nome || 'Sem campo'
      const produtosData = Array.isArray(p.expand?.produto)
        ? (p.expand?.produto as Produto[])
        : p.expand?.produto
          ? [p.expand.produto as Produto]
          : []
      if (produtosData.length === 0) {
        contagem[campo] = contagem[campo] || {}
        contagem[campo]['Sem produto'] =
          (contagem[campo]['Sem produto'] || 0) + 1
      } else {
        produtosData.forEach((pr: Produto) => {
          const nome = pr?.nome || 'Sem produto'
          contagem[campo] = contagem[campo] || {}
          contagem[campo][nome] = (contagem[campo][nome] || 0) + 1
        })
      }
    })
    const campos = Object.keys(contagem)
    const produtos = Array.from(
      new Set(campos.flatMap((c) => Object.keys(contagem[c]))),
    )
    const palette = [
      twColors.primary600,
      twColors.error600,
      twColors.blue500,
      colors.emerald[500],
      colors.amber[500],
      colors.violet[500],
    ]
    const datasets = produtos.map((prod, idx) => ({
      label: prod,
      data: campos.map((c) => contagem[c][prod] || 0),
      backgroundColor: palette[idx % palette.length],
    }))
    return { labels: campos, datasets }
  })()

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="card text-center">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-sm font-bold dark:text-gray-100 ">
              Total de Inscrições
            </h2>
            <Tippy content="Todas as inscrições feitas no sistema.">
              <span>
                <Info className="w-4 h-4 text-red-600 dark:text-gray-100" />
              </span>
            </Tippy>
          </div>
          <p className="text-3xl font-bold dark:text-gray-100">
            {totalInscricoes}
          </p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-sm font-bold dark:text-gray-100">
              Total de Pedidos
            </h2>
            <Tippy content="Todos os pedidos gerados.">
              <span>
                <Info className="w-4 h-4 text-red-600 dark:text-gray-100" />
              </span>
            </Tippy>
          </div>
          <p className="text-3xl font-bold dark:text-gray-100">
            {totalPedidos}
          </p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-sm font-bold dark:text-gray-100">
              Valor Total
            </h2>
            <Tippy content="Soma dos pedidos pagos com inscrições confirmadas.">
              <span>
                <Info className="w-4 h-4 text-red-600 dark:text-gray-100" />
              </span>
            </Tippy>
          </div>
          <p className="text-3xl font-bold dark:text-gray-100">
            R$ {valorTotalConfirmado.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Seção de Exportação */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold dark:text-gray-100">
              Exportar Relatórios
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Tippy content="Exportar relatório completo com resumo, inscrições, pedidos e estatísticas">
              <button
                onClick={handleExportComplete}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <Download className="w-4 h-4" />
                Relatório Completo (XLSX)
              </button>
            </Tippy>
            <Tippy content="Exportar apenas dados das inscrições">
              <button
                onClick={handleExportInscricoes}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <Download className="w-4 h-4" />
                Inscrições (XLSX)
              </button>
            </Tippy>
            <Tippy content="Exportar apenas dados dos pedidos">
              <button
                onClick={handleExportPedidos}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <Download className="w-4 h-4" />
                Pedidos (XLSX)
              </button>
            </Tippy>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 mb-4">
        {['pendente', 'confirmado', 'cancelado'].map((status) => (
          <div key={status} className="card text-center">
            <h3 className="text-sm font-semibold dark:text-gray-100">
              Inscrições {status.charAt(0).toUpperCase() + status.slice(1)}
            </h3>
            <p className="text-xl font-bold dark:text-gray-100">
              {statusInscricoes[status] || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2 mb-8">
        {['pendente', 'pago', 'vencido', 'cancelado'].map((status) => (
          <div key={status} className="card text-center">
            <h3 className="text-sm font-semibold dark:text-gray-100">
              Pedidos {status.charAt(0).toUpperCase() + status.slice(1)}
            </h3>
            <p className="text-xl font-bold dark:text-gray-100">
              {statusPedidos[status] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-800 dark:text-gray-100">
              Pedidos:
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 rounded-md bg-gray-800 text-gray-100 border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 w-full md:w-64"
            >
              {['pago', 'pendente', 'vencido', 'cancelado'].map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-800 dark:text-gray-100">
              Inscrições:
            </label>
            <select
              value={filtroInscricoes}
              onChange={(e) => setFiltroInscricoes(e.target.value)}
              className="px-4 py-2 rounded-md bg-gray-800 text-gray-100 border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 w-full md:w-64"
            >
              {['pendente', 'confirmado', 'cancelado', 'todos'].map(
                (status) => (
                  <option key={status} value={status}>
                    {status === 'todos'
                      ? 'Todas'
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-5 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Inscrições por Campo
              </h3>
              <Tippy content="Distribuição de inscrições por campo de atuação.">
                <span>
                  <Info className="w-4 h-4 text-red-600" />
                </span>
              </Tippy>
            </div>
            <div className="aspect-video">
              <Bar
                data={inscricoesChart}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>

          <div className="card p-5 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Pedidos por Campo
              </h3>
              <Tippy
                content={`Distribuição dos pedidos com status "${filtroStatus}" por campo.`}
              >
                <span>
                  <Info className="w-4 h-4 text-red-600" />
                </span>
              </Tippy>
            </div>
            <div className="aspect-video">
              <Bar
                data={pedidosChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                }}
              />
            </div>
          </div>
          <div className="card p-5 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Pedidos por Campo e Produto
              </h3>
            </div>
            <div className="aspect-video">
              <Bar
                id="campoProdutoChart"
                data={pedidosCampoProdutoChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { x: { stacked: true }, y: { stacked: true } },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
