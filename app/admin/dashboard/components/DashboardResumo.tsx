'use client'

import type { Inscricao, Pedido, Produto } from '@/types'
import {
  exportToExcel,
  exportInscricoesToExcel,
  exportPedidosToExcel,
} from '@/lib/utils/excelExport'
import { generatePDF } from '@/lib/services/pdfGenerator'
import ResumoCards from './ResumoCards'
import ExportButtons from './ExportButtons'

interface DashboardResumoProps {
  inscricoes: Inscricao[]
  pedidos: Pedido[]
  produtos?: Produto[]
  totalInscricoes?: number
  totalPedidos?: number
}

export default function DashboardResumo({
  inscricoes,
  pedidos,
  produtos = [],
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

    // Mostrar feedback visual
    const button = document.querySelector('[data-pdf-button]') as HTMLButtonElement
    if (button) {
      button.innerHTML = '<span>Gerando PDF...</span>'
      button.disabled = true
    }

    // Gerar PDF usando o serviço
    generatePDF(inscricoes, pedidos, produtos, valorTotalConfirmado)
  }

  // Verificar se há dados para exibir
  const hasData = inscricoes.length > 0 || pedidos.length > 0

  if (!hasData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Nenhum dado disponível
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Não há inscrições ou pedidos para exibir no momento.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          📊 Resumo Geral
        </h2>
        <ResumoCards
          totalInscricoes={totalInscricoesFiltradas}
          totalPedidos={totalPedidosFiltrados}
          valorTotal={valorTotalConfirmado}
        />
      </div>

      {/* Botões de Exportação */}
      <ExportButtons
        onExportComplete={handleExportComplete}
        onExportInscricoes={handleExportInscricoes}
        onExportPedidos={handleExportPedidos}
        onExportPDF={handleExportPDF}
      />
    </div>
  )
}
