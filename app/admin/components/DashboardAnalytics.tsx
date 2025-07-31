'use client'

import { useEffect, useState, useRef } from 'react'
import { setupCharts } from '@/lib/chartSetup'
import dynamic from 'next/dynamic'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import type { Chart } from 'chart.js'
import { generateDashboardPdf } from '@/lib/report/generateDashboardPdf'
import { useToast } from '@/lib/context/ToastContext'
import type { Inscricao, Pedido } from '@/types'
import twColors from '@/utils/twColors'

const LineChart = dynamic(() => import('react-chartjs-2').then((m) => m.Line), {
  ssr: false,
})
const BarChart = dynamic(() => import('react-chartjs-2').then((m) => m.Bar), {
  ssr: false,
})

interface DashboardAnalyticsProps {
  inscricoes: Inscricao[]
  pedidos: Pedido[]
  statusInscricao: string
  statusPedido: string
  onStatusInscricaoChange: (status: string) => void
  onStatusPedidoChange: (status: string) => void
  mostrarFinanceiro?: boolean
}

function groupByDate(
  items: { created?: string }[],
  start?: string,
  end?: string,
) {
  const counts: Record<string, number> = {}
  const startDate = start ? new Date(start) : null
  const endDate = end ? new Date(end) : null

  items.forEach((i) => {
    if (!i.created) return
    const dateObj = new Date(i.created)
    if (startDate && dateObj < startDate) return
    if (endDate && dateObj > endDate) return
    const d = dateObj.toISOString().slice(0, 10)
    counts[d] = (counts[d] || 0) + 1
  })
  const dates = Object.keys(counts).sort()
  return { labels: dates, data: dates.map((d) => counts[d]) }
}

export default function DashboardAnalytics({
  inscricoes,
  pedidos,
  statusInscricao,
  statusPedido,
  onStatusInscricaoChange,
  onStatusPedidoChange,
  mostrarFinanceiro = true,
}: DashboardAnalyticsProps) {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    setupCharts()
  }, [])

  const inscricoesData = groupByDate(inscricoes, startDate, endDate)
  const pedidosData = groupByDate(pedidos, startDate, endDate)

  const inscricoesChart = {
    labels: inscricoesData.labels,
    datasets: [
      {
        label: 'Inscrições',
        data: inscricoesData.data,
        fill: true,
        borderColor: twColors.primary600,
        backgroundColor: 'rgba(124,58,237,0.2)',
      },
    ],
  }

  const pedidosChart = {
    labels: pedidosData.labels,
    datasets: [
      {
        label: 'Pedidos',
        data: pedidosData.data,
        fill: true,
        borderColor: twColors.blue500,
        backgroundColor: 'rgba(14,165,233,0.2)',
      },
    ],
  }

  const filteredPedidos = pedidos.filter((p) => {
    if (!p.created) return false
    const dateObj = new Date(p.created)
    if (startDate && dateObj < new Date(startDate)) return false
    if (endDate && dateObj > new Date(endDate)) return false
    return true
  })

  const valores = filteredPedidos.map((p) => Number(p.valor) || 0)
  const mediaValor = valores.length
    ? valores.reduce((a, b) => a + b, 0) / valores.length
    : 0

  const arrecadacaoCampo: Record<string, number> = {}
  filteredPedidos.forEach((p) => {
    if (p.status === 'pago') {
      const campo = p.expand?.campo?.nome || 'Sem campo'
      const v = Number(p.valor) || 0
      arrecadacaoCampo[campo] = (arrecadacaoCampo[campo] || 0) + v
    }
  })

  const arrecadacaoLabels = Object.keys(arrecadacaoCampo)
  const arrecadacaoChart = {
    labels: arrecadacaoLabels,
    datasets: [
      {
        label: 'Arrecadação (R$)',
        data: arrecadacaoLabels.map((l) => arrecadacaoCampo[l]),
        backgroundColor: twColors.primary600,
      },
    ],
  }

  // Análise de tamanhos
  const tamanhosCount: Record<string, number> = {}
  const tamanhosInscricoes: Record<string, number> = {}
  const tamanhosPedidos: Record<string, number> = {}

  inscricoes.forEach((i) => {
    if (i.tamanho) {
      tamanhosInscricoes[i.tamanho] = (tamanhosInscricoes[i.tamanho] || 0) + 1
      tamanhosCount[i.tamanho] = (tamanhosCount[i.tamanho] || 0) + 1
    }
  })

  pedidos.forEach((p) => {
    if (p.tamanho) {
      tamanhosPedidos[p.tamanho] = (tamanhosPedidos[p.tamanho] || 0) + 1
      tamanhosCount[p.tamanho] = (tamanhosCount[p.tamanho] || 0) + 1
    }
  })

  const tamanhosLabels = ['PP', 'P', 'M', 'G', 'GG'].filter(
    (t) => tamanhosCount[t] > 0,
  )
  const tamanhosChart = {
    labels: tamanhosLabels,
    datasets: [
      {
        label: 'Inscrições',
        data: tamanhosLabels.map((t) => tamanhosInscricoes[t] || 0),
        backgroundColor: twColors.primary600,
      },
      {
        label: 'Pedidos',
        data: tamanhosLabels.map((t) => tamanhosPedidos[t] || 0),
        backgroundColor: twColors.blue500,
      },
    ],
  }

  const { showError } = useToast()

  const inscricoesRef = useRef<Chart<'line'> | null>(null)
  const pedidosRef = useRef<Chart<'line'> | null>(null)
  const arrecadacaoRef = useRef<Chart<'bar'> | null>(null)
  const tamanhosRef = useRef<Chart<'bar'> | null>(null)

  const handleExportPDF = async () => {
    const campoProdutoCanvas = document.getElementById(
      'campoProdutoChart',
    ) as HTMLCanvasElement | null
    const charts = {
      inscricoes: inscricoesRef.current?.toBase64Image(),
      pedidos: pedidosRef.current?.toBase64Image(),
      campoProduto: campoProdutoCanvas?.toDataURL('image/png'),
      arrecadacao: mostrarFinanceiro
        ? arrecadacaoRef.current?.toBase64Image()
        : undefined,
      tamanhos:
        tamanhosLabels.length > 0
          ? tamanhosRef.current?.toBase64Image()
          : undefined,
    }

    const metrics = {
      labels: inscricoesData.labels,
      inscricoes: inscricoesData.data,
      pedidos: pedidosData.data,
      mediaValor,
      arrecadacao: arrecadacaoCampo,
      tamanhos: tamanhosCount,
    }

    try {
      await generateDashboardPdf(
        metrics,
        { start: startDate, end: endDate },
        charts,
      )
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      showError('Erro ao gerar PDF')
    }
  }

  // Nova função para gerar PDF específico para camisaria
  const handleExportCamisariaPDF = async () => {
    try {
      // Agrupar pedidos por campo e tamanho
      const pacotesPorCampo: Record<string, Record<string, number>> = {}
      
      pedidos.forEach((pedido) => {
        const campo = pedido.expand?.campo?.nome || 'Sem campo'
        const tamanho = pedido.tamanho || 'Sem tamanho'
        
        if (!pacotesPorCampo[campo]) {
          pacotesPorCampo[campo] = {}
        }
        
        pacotesPorCampo[campo][tamanho] = (pacotesPorCampo[campo][tamanho] || 0) + 1
      })

      // Criar PDF específico para camisaria
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      // Título
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('RELATÓRIO DE PACOTES - CAMISARIA', 105, 20, { align: 'center' })
      
      // Data
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 30, { align: 'center' })
      
      let yPosition = 50
      
      // Para cada campo, criar uma seção
      Object.entries(pacotesPorCampo).forEach(([campo, tamanhos], index) => {
        // Título do campo
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text(`CAMPO: ${campo.toUpperCase()}`, 20, yPosition)
        yPosition += 10
        
        // Tabela de tamanhos
        const tamanhosOrdenados = ['PP', 'P', 'M', 'G', 'GG']
        const dadosTabela = tamanhosOrdenados.map(tamanho => [
          tamanho,
          tamanhos[tamanho] || 0
        ]).filter(row => (row[1] as number) > 0) // Só incluir tamanhos com quantidade > 0
        
        if (dadosTabela.length > 0) {
          // Cabeçalho da tabela
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('Tamanho', 30, yPosition)
          doc.text('Quantidade', 100, yPosition)
          yPosition += 8
          
                     // Dados da tabela
           doc.setFont('helvetica', 'normal')
           dadosTabela.forEach(([tamanho, quantidade]) => {
             doc.text(tamanho as string, 30, yPosition)
             doc.text((quantidade as number).toString(), 100, yPosition)
             yPosition += 6
           })
          
          // Total do campo
          const totalCampo = Object.values(tamanhos).reduce((sum, qty) => sum + qty, 0)
          doc.setFont('helvetica', 'bold')
          doc.text(`TOTAL: ${totalCampo} camisetas`, 30, yPosition)
          yPosition += 15
        }
        
        // Quebra de página se necessário
        if (yPosition > 250 && index < Object.keys(pacotesPorCampo).length - 1) {
          doc.addPage()
          yPosition = 20
        }
      })
      
      // Resumo geral
      doc.addPage()
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('RESUMO GERAL', 105, 20, { align: 'center' })
      
      const totalGeral = pedidos.length
      const totalPorTamanho: Record<string, number> = {}
      
      pedidos.forEach(pedido => {
        const tamanho = pedido.tamanho || 'Sem tamanho'
        totalPorTamanho[tamanho] = (totalPorTamanho[tamanho] || 0) + 1
      })
      
      yPosition = 40
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('TOTAL GERAL POR TAMANHO:', 20, yPosition)
      yPosition += 10
      
             doc.setFont('helvetica', 'normal')
       const tamanhosOrdenadosResumo = ['PP', 'P', 'M', 'G', 'GG']
       tamanhosOrdenadosResumo.forEach((tamanho: string) => {
         const quantidade = totalPorTamanho[tamanho] || 0
         if (quantidade > 0) {
           doc.text(`${tamanho}: ${quantidade}`, 30, yPosition)
           yPosition += 6
         }
       })
      
      yPosition += 10
      doc.setFont('helvetica', 'bold')
      doc.text(`TOTAL GERAL: ${totalGeral} camisetas`, 20, yPosition)
      
      // Salvar PDF
      doc.save('relatorio-camisaria-pacotes.pdf')
    } catch (err) {
      console.error('Erro ao gerar PDF da camisaria:', err)
      showError('Erro ao gerar PDF da camisaria')
    }
  }

  const handleExportXLSX = () => {
    const rows = inscricoesData.labels.map((d, idx) => ({
      Data: d,
      Inscricoes: inscricoesData.data[idx] || 0,
      Pedidos: pedidosData.data[idx] || 0,
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados')
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, 'dashboard.xlsx')
  }

  return (
    <div className="card mb-8">
      <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">
        Análises Temporais{mostrarFinanceiro ? ' e Financeiras' : ''}
      </h3>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm dark:text-gray-100" htmlFor="inicio">
            Início:
          </label>
          <input
            id="inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm dark:text-gray-100" htmlFor="fim">
            Fim:
          </label>
          <input
            id="fim"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm dark:text-gray-100" htmlFor="statusInscricao">
            Status Inscrição:
          </label>
          <select
            id="statusInscricao"
            value={statusInscricao}
            onChange={(e) => onStatusInscricaoChange(e.target.value)}
            className="border rounded px-2 py-1 bg-white"
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="aguardando_pagamento">Aguardando Pagamento</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm dark:text-gray-100" htmlFor="statusPedido">
            Status Pedido:
          </label>
          <select
            id="statusPedido"
            value={statusPedido}
            onChange={(e) => onStatusPedidoChange(e.target.value)}
            className="border rounded px-2 py-1 bg-white"
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="vencido">Vencido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <button onClick={handleExportPDF} className="btn btn-primary px-3 py-1">
          PDF Geral
        </button>
        <button 
          onClick={handleExportCamisariaPDF} 
          className="btn btn-secondary px-3 py-1"
        >
          PDF Camisas
        </button>
        <button
          onClick={handleExportXLSX}
          className="btn btn-primary px-3 py-1"
        >
          Exportar XLSX
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card p-4">
          <h4 className="font-medium mb-2 dark:text-gray-100">
            Evolução de Inscrições
          </h4>
          <div className="aspect-video">
            <LineChart
              ref={inscricoesRef}
              data={inscricoesChart}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
        <div className="card p-4">
          <h4 className="font-medium mb-2 dark:text-gray-100">
            Evolução de Pedidos
          </h4>
          <div className="aspect-video">
            <LineChart
              ref={pedidosRef}
              data={pedidosChart}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
      {mostrarFinanceiro && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-4 flex flex-col justify-center items-center">
            <p className="text-sm dark:text-gray-100">
              Média de Valor por Pedido
            </p>
            <p className="text-2xl font-bold dark:text-gray-100">
              R$ {mediaValor.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="card p-4">
            <h4 className="font-medium mb-2 dark:text-gray-100">
              Arrecadação por Campo
            </h4>
            <div className="aspect-video">
              <BarChart
                ref={arrecadacaoRef}
                data={arrecadacaoChart}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Análise de Tamanhos */}
      {tamanhosLabels.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-4 dark:text-gray-100">
            Distribuição por Tamanho
          </h4>
          <div className="card p-4">
            <div className="aspect-video">
              <BarChart
                ref={tamanhosRef}
                data={tamanhosChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
