'use client'

import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

interface ExportButtonsProps {
  onExportComplete: () => void
  onExportInscricoes: () => void
  onExportPedidos: () => void
  onExportPDF: () => void
}

export default function ExportButtons({
  onExportComplete,
  onExportInscricoes,
  onExportPedidos,
  onExportPDF,
}: ExportButtonsProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Download className="w-5 h-5" />
        📊 Exportar Relatórios
      </h2>
      
      <div className="relative inline-block text-left">
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          onClick={() => {
            const dropdown = document.getElementById('export-dropdown')
            dropdown?.classList.toggle('hidden')
          }}
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
        
        <div
          id="export-dropdown"
          className="hidden absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
        >
          <div className="py-2">
            <Tippy content="Relatório completo com todos os dados e estatísticas">
              <button
                onClick={onExportComplete}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Relatório Completo</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">XLSX - Todos os dados</div>
                </div>
              </button>
            </Tippy>
            
            <Tippy content="Apenas dados das inscrições">
              <button
                onClick={onExportInscricoes}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Apenas Inscrições</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">XLSX - Dados de inscrições</div>
                </div>
              </button>
            </Tippy>
            
            <Tippy content="Apenas dados dos pedidos">
              <button
                onClick={onExportPedidos}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Apenas Pedidos</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">XLSX - Dados de pedidos</div>
                </div>
              </button>
            </Tippy>
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            
            <Tippy content="Relatório em PDF para impressão">
              <button
                data-pdf-button
                onClick={onExportPDF}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FileText className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Relatório PDF</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">PDF - Para impressão</div>
                </div>
              </button>
            </Tippy>
          </div>
        </div>
      </div>
    </div>
  )
} 