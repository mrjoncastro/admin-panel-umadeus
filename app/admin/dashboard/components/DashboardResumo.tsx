'use client'

import { Info, Download, FileSpreadsheet, FileText } from 'lucide-react'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import type { Inscricao, Pedido } from '@/types'
import {
  exportToExcel,
  exportInscricoesToExcel,
  exportPedidosToExcel,
} from '@/lib/utils/excelExport'

interface DashboardResumoProps {
  inscricoes: Inscricao[]
  pedidos: Pedido[]
  totalInscricoes?: number
  totalPedidos?: number
}

export default function DashboardResumo({
  inscricoes,
  pedidos,
  totalInscricoes,
  totalPedidos,
}: DashboardResumoProps) {
  // Calcular totais com base nos dados filtrados ou usar props se fornecidas
  const totalInscricoesFiltradas = totalInscricoes || inscricoes.length
  const totalPedidosFiltrados = totalPedidos || pedidos.length
  
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
      totalInscricoes: totalInscricoesFiltradas,
      totalPedidos: totalPedidosFiltrados,
      valorTotal: valorTotalConfirmado,
    })
  }

  const handleExportInscricoes = () => {
    exportInscricoesToExcel(inscricoes)
  }

  const handleExportPedidos = () => {
    exportPedidosToExcel(pedidos)
  }

  const handleExportPDF = () => {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') {
      console.error('PDF só pode ser gerado no navegador')
      return
    }

    // Importação dinâmica do jsPDF
    import('jspdf')
      .then(({ default: jsPDF }) => {
        const doc = new jsPDF()
        
        // Título
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('Relatório de Dashboard', 105, 20, { align: 'center' })
        
        // Data
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        const dataAtual = new Date().toLocaleDateString('pt-BR')
        doc.text(`Data: ${dataAtual}`, 20, 40)
        
        // Resumos
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('Resumo Geral', 20, 60)
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text(`Total de Inscrições: ${totalInscricoesFiltradas}`, 20, 80)
        doc.text(`Total de Pedidos: ${totalPedidosFiltrados}`, 20, 95)
        doc.text(`Valor Total: R$ ${valorTotalConfirmado.toFixed(2)}`, 20, 110)
        
        // Status das Inscrições
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Status das Inscrições', 20, 140)
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        let y = 160
        Object.entries(statusInscricoes).forEach(([status, count]) => {
          doc.text(`${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`, 20, y)
          y += 15
        })
        
        // Status dos Pedidos
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Status dos Pedidos', 20, y + 10)
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        y += 30
        Object.entries(statusPedidos).forEach(([status, count]) => {
          doc.text(`${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`, 20, y)
          y += 15
        })
        
        // Salvar o PDF
        doc.save('dashboard-resumo.pdf')
      })
      .catch((error) => {
        console.error('Erro ao gerar PDF:', error)
        alert('Erro ao gerar PDF. Verifique o console para mais detalhes.')
      })
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

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="card text-center">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-sm font-bold dark:text-gray-100 ">
              Total de Inscrições
            </h2>
            <Tippy content="Inscrições filtradas conforme os critérios aplicados.">
              <span>
                <Info className="w-4 h-4 text-red-600 dark:text-gray-100" />
              </span>
            </Tippy>
          </div>
          <p className="text-3xl font-bold dark:text-gray-100">
            {totalInscricoesFiltradas}
          </p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-sm font-bold dark:text-gray-100">
              Total de Pedidos
            </h2>
            <Tippy content="Pedidos filtrados conforme os critérios aplicados.">
              <span>
                <Info className="w-4 h-4 text-red-600 dark:text-gray-100" />
              </span>
            </Tippy>
          </div>
          <p className="text-3xl font-bold dark:text-gray-100">
            {totalPedidosFiltrados}
          </p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center items-center gap-2 mb-1">
            <h2 className="text-sm font-bold dark:text-gray-100">
              Valor Total
            </h2>
            <Tippy content="Soma dos pedidos pagos com inscrições confirmadas, filtrados conforme os critérios aplicados.">
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

      {/* Seção de Exportação - Final da Página */}
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
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <Download className="w-4 h-4" />
                Relatório Completo (XLSX)
              </button>
            </Tippy>
            <Tippy content="Exportar apenas dados das inscrições">
              <button
                onClick={handleExportInscricoes}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <Download className="w-4 h-4" />
                Inscrições (XLSX)
              </button>
            </Tippy>
            <Tippy content="Exportar apenas dados dos pedidos">
              <button
                onClick={handleExportPedidos}
                className="flex items-center gap-2 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <Download className="w-4 h-4" />
                Pedidos (XLSX)
              </button>
            </Tippy>
            <Tippy content="Gerar relatório em formato PDF">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <FileText className="w-4 h-4" />
                Relatório (PDF)
              </button>
            </Tippy>
          </div>
        </div>
      </div>
    </>
  )
}
