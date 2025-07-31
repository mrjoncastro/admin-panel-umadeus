'use client'

import type { Inscricao, Pedido, Produto } from '@/types'
import ResumoCards from './ResumoCards'

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
        <ResumoCards
          totalInscricoes={totalInscricoesFiltradas}
          totalPedidos={totalPedidosFiltrados}
          valorTotal={valorTotalConfirmado}
        />
      </div>
    </div>
  )
}
