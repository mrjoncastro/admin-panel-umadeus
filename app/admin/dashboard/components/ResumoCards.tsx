'use client'

import { Info } from 'lucide-react'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

interface ResumoCardsProps {
  totalInscricoes: number
  totalPedidos: number
  valorTotal: number
}

export default function ResumoCards({
  totalInscricoes,
  totalPedidos,
  valorTotal,
}: ResumoCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {/* Card Inscrições */}
      <div className="card text-center border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
        <div className="flex justify-center items-center gap-2 mb-2">
          <span className="text-2xl">📝</span>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">
            Inscrições Realizadas
          </h3>
          <Tippy content="Inscrições filtradas conforme os critérios aplicados.">
            <span>
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </span>
          </Tippy>
        </div>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {totalInscricoes}
        </p>
      </div>

      {/* Card Pedidos */}
      <div className="card text-center border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-gray-800">
        <div className="flex justify-center items-center gap-2 mb-2">
          <span className="text-2xl">🛒</span>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">
            Pedidos Realizados
          </h3>
          <Tippy content="Pedidos filtrados conforme os critérios aplicados.">
            <span>
              <Info className="w-4 h-4 text-green-600 dark:text-green-400" />
            </span>
          </Tippy>
        </div>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
          {totalPedidos}
        </p>
      </div>

      {/* Card Valor Total */}
      <div className="card text-center border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800">
        <div className="flex justify-center items-center gap-2 mb-2">
          <span className="text-2xl">💰</span>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">
            Valor Total
          </h3>
          <Tippy content="Soma dos pedidos pagos com inscrições confirmadas, filtrados conforme os critérios aplicados.">
            <span>
              <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </span>
          </Tippy>
        </div>
        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
          R$ {valorTotal.toFixed(2)}
        </p>
      </div>
    </div>
  )
} 