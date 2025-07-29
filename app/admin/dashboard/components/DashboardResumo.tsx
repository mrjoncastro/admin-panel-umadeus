'use client'

import { Info, Download, FileSpreadsheet, FileText } from 'lucide-react'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import type { Inscricao, Pedido, Produto } from '@/types'
import {
  exportToExcel,
  exportInscricoesToExcel,
  exportPedidosToExcel,
} from '@/lib/utils/excelExport'

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
    let originalText = ''
    if (button) {
      originalText = button.innerHTML
      button.innerHTML = '<span>Gerando PDF...</span>'
      button.disabled = true
    }

    // Importação dinâmica do jsPDF
    import('jspdf')
      .then(({ default: jsPDF }) => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const margin = 20
        
        // Determinar o contexto
        const isRelatorios = window.location.pathname.includes('/relatorios')
        const isLider = window.location.pathname.includes('/lider')
        
        // Verificar se há filtro de evento ativo (para relatórios)
        const urlParams = new URLSearchParams(window.location.search)
        const eventoFiltro = urlParams.get('evento')
        const eventoSelecionado = eventoFiltro && eventoFiltro !== 'todos' ? eventoFiltro : null
        
        // PÁGINA 1 - CAPA
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text('Relatório Executivo', pageWidth / 2, 40, { align: 'center' })
        
        if (isRelatorios) {
          doc.setFontSize(18)
          if (eventoSelecionado) {
            doc.text('Análise de Dados por Evento', pageWidth / 2, 60, { align: 'center' })
          } else {
            doc.text('Análise de Dados Filtrados', pageWidth / 2, 60, { align: 'center' })
          }
        } else {
          doc.setFontSize(18)
          doc.text('Dashboard Geral', pageWidth / 2, 60, { align: 'center' })
        }
        
        // Período de análise
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        const dataAtual = new Date().toLocaleDateString('pt-BR')
        const horaAtual = new Date().toLocaleTimeString('pt-BR', { 
          timeZone: 'America/Sao_Paulo',
          hour12: false 
        })
        doc.text(`Período de Análise: ${dataAtual}`, pageWidth / 2, 100, { align: 'center' })
        doc.text(`Emissão: ${dataAtual} ${horaAtual} BRT`, pageWidth / 2, 115, { align: 'center' })
        
        // Rodapé da capa
        doc.setFontSize(9)
        doc.text('Desenvolvido por M24', pageWidth - margin, pageHeight - 20, { align: 'right' })
        
        // PÁGINA 2 - SUMÁRIO
        doc.addPage()
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text('Sumário', margin, 40)
        
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text('1. Visão Estratégica', margin, 70)
        doc.text('2. Panorama Geral', margin, 85)
        doc.text('3. Status das Inscrições', margin, 100)
        doc.text('4. Status dos Pedidos', margin, 115)
        doc.text('5. Tabelas de Análise', margin, 130)
        doc.text('6. Tabelas de Pedidos', margin, 145)
        
        // Rodapé
        doc.setFontSize(9)
        doc.text('Página 2 de 6', pageWidth / 2, pageHeight - 20, { align: 'center' })
        doc.text('Desenvolvido por M24', pageWidth - margin, pageHeight - 20, { align: 'right' })
        
        // PÁGINA 3 - VISÃO ESTRATÉGICA
        doc.addPage()
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text('Visão Estratégica', margin, 40)
        
        // Cards de KPI com borda dupla
        const cardWidth = 50
        const cardHeight = 30
        const startX = margin
        const startY = 60
        
        // Card 1 - Total de Inscrições
        doc.setDrawColor(0)
        doc.setLineWidth(0.5)
        doc.rect(startX, startY, cardWidth, cardHeight)
        doc.rect(startX + 1, startY + 1, cardWidth - 2, cardHeight - 2)
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Total Inscrições', startX + cardWidth / 2, startY + 8, { align: 'center' })
        doc.setFontSize(14)
        doc.text(totalInscricoesFiltradas.toString(), startX + cardWidth / 2, startY + 20, { align: 'center' })
        
        // Card 2 - Total de Pedidos
        doc.rect(startX + cardWidth + 10, startY, cardWidth, cardHeight)
        doc.rect(startX + cardWidth + 11, startY + 1, cardWidth - 2, cardHeight - 2)
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Total Pedidos', startX + cardWidth + 10 + cardWidth / 2, startY + 8, { align: 'center' })
        doc.setFontSize(14)
        doc.text(totalPedidosFiltrados.toString(), startX + cardWidth + 10 + cardWidth / 2, startY + 20, { align: 'center' })
        
        // Card 3 - Valor Total
        doc.rect(startX + (cardWidth + 10) * 2, startY, cardWidth, cardHeight)
        doc.rect(startX + (cardWidth + 10) * 2 + 1, startY + 1, cardWidth - 2, cardHeight - 2)
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Valor Total', startX + (cardWidth + 10) * 2 + cardWidth / 2, startY + 8, { align: 'center' })
        doc.setFontSize(14)
        doc.text(`R$ ${valorTotalConfirmado.toFixed(2)}`, startX + (cardWidth + 10) * 2 + cardWidth / 2, startY + 20, { align: 'center' })
        
        // Rodapé
        doc.setFontSize(9)
        doc.text('Página 3 de 6', pageWidth / 2, pageHeight - 20, { align: 'center' })
        doc.text('Desenvolvido por M24', pageWidth - margin, pageHeight - 20, { align: 'right' })
        
        // PÁGINA 4 - PANORAMA GERAL COM GRÁFICOS
        doc.addPage()
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text('Panorama Geral', margin, 40)
        
        // Gráfico de Status das Inscrições
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Status das Inscrições', margin, 70)
        
        // Criar gráfico de barras horizontais para inscrições
        const inscricoesData = Object.entries(statusInscricoes)
        const maxInscricoes = Math.max(...inscricoesData.map(([, count]) => count), 1)
        const barHeight = 12
        const barSpacing = 18
        let yInscricoesChart = 90
        
        // Cores da paleta do sistema (tons de vermelho/azul)
        const inscricoesColors = [
          [220, 38, 38],   // Vermelho principal
          [239, 68, 68],   // Vermelho mais claro
          [185, 28, 28],   // Vermelho mais escuro
          [59, 130, 246],  // Azul
          [37, 99, 235]    // Azul mais escuro
        ]
        
        inscricoesData.forEach(([status, count], index) => {
          const barWidth = (count / maxInscricoes) * 100 // Largura reduzida para evitar corte
          const barY = yInscricoesChart + (index * barSpacing)
          
          // Verificar se há espaço suficiente na página
          if (barY > pageHeight - 80) {
            // Adicionar nova página para gráficos
            doc.addPage()
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('Panorama Geral (continuação)', margin, 40)
            yInscricoesChart = 60
          }
          
          // Texto do status
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          doc.text(`${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`, margin, barY + 3)
          
          // Barra do gráfico com cores da paleta
          const color = inscricoesColors[index % inscricoesColors.length]
          doc.setFillColor(color[0], color[1], color[2])
          doc.rect(margin + 70, barY, barWidth, barHeight, 'F')
          
          // Borda da barra
          doc.setDrawColor(0)
          doc.setLineWidth(0.3)
          doc.rect(margin + 70, barY, barWidth, barHeight)
        })
        
        // Gráfico de Status dos Pedidos
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Status dos Pedidos', margin, yInscricoesChart + 80)
        
        // Criar gráfico de barras horizontais para pedidos
        const pedidosData = Object.entries(statusPedidos)
        const maxPedidos = Math.max(...pedidosData.map(([, count]) => count), 1)
        let yPedidosChart = yInscricoesChart + 100
        
        // Cores da paleta do sistema (tons de verde/amarelo)
        const pedidosColors = [
          [34, 197, 94],   // Verde principal
          [22, 163, 74],   // Verde mais escuro
          [234, 179, 8],   // Amarelo
          [202, 138, 4],   // Amarelo mais escuro
          [16, 185, 129]   // Verde azulado
        ]
        
        pedidosData.forEach(([status, count], index) => {
          const barWidth = (count / maxPedidos) * 100 // Largura reduzida para evitar corte
          const barY = yPedidosChart + (index * barSpacing)
          
          // Verificar se há espaço suficiente na página
          if (barY > pageHeight - 80) {
            // Adicionar nova página para gráficos
            doc.addPage()
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('Panorama Geral (continuação)', margin, 40)
            yPedidosChart = 60
          }
          
          // Texto do status
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          doc.text(`${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`, margin, barY + 3)
          
          // Barra do gráfico com cores da paleta
          const color = pedidosColors[index % pedidosColors.length]
          doc.setFillColor(color[0], color[1], color[2])
          doc.rect(margin + 70, barY, barWidth, barHeight, 'F')
          
          // Borda da barra
          doc.setDrawColor(0)
          doc.setLineWidth(0.3)
          doc.rect(margin + 70, barY, barWidth, barHeight)
        })
        
        // Legenda dos gráficos
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.text('* Gráficos de barras horizontais representando a distribuição por status', margin, pageHeight - 40)
        
        // Rodapé
        doc.setFontSize(9)
        doc.text('Página 4 de 6', pageWidth / 2, pageHeight - 20, { align: 'center' })
        doc.text('Desenvolvido por M24', pageWidth - margin, pageHeight - 20, { align: 'right' })
        
        // PÁGINA 5 - TABELAS DE ANÁLISE (TODOS OS DADOS)
        doc.addPage()
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text('Tabelas de Análise', margin, 40)
        
        // Informação sobre inclusão completa de dados
        doc.setFontSize(10)
        doc.setFont('helvetica', 'italic')
        doc.text('* Todas as inscrições e pedidos serão incluídos para conferência completa', margin, 55)
        
        // Tabela de Inscrições Detalhadas com paginação automática
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Inscrições Detalhadas', margin, 75)
        
        // Cabeçalho da tabela - Layout otimizado
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('CPF', margin, 95)
        doc.text('Nome', margin + 40, 95)
        doc.text('Email', margin + 110, 95)
        doc.text('Status', margin + 170, 95)
        doc.text('Data', margin + 210, 95)
        
        // Linha separadora
        doc.line(margin, 100, pageWidth - margin, 100)
        
        // Dados das inscrições com paginação automática - TODOS OS DADOS
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        let yInscricoes = 110
        let currentPage = 5
        // Calcular quantos itens cabem por página (espaço para cabeçalho + margem)
        let itemsPerPage = Math.floor((pageHeight - 140) / 10) // Margem maior para garantir espaço
        
        // IMPORTANTE: Incluir TODAS as inscrições sem limitação
        inscricoes.forEach((inscricao, index) => {
          // Verificar se precisa de nova página (margem de segurança)
          if (yInscricoes > pageHeight - 50) {
            // Adicionar rodapé da página atual
            doc.setFontSize(9)
            doc.text(`Página ${currentPage}`, pageWidth / 2, pageHeight - 20, { align: 'center' })
            doc.text('Desenvolvido por M24', pageWidth - margin, pageHeight - 20, { align: 'right' })
            
            // Nova página
            doc.addPage()
            currentPage++
            
            // Repetir cabeçalho na nova página (continuação)
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text('Inscrições Detalhadas (continuação)', margin, 40)
            
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text('CPF', margin, 60)
            doc.text('Nome', margin + 40, 60)
            doc.text('Email', margin + 110, 60)
            doc.text('Status', margin + 170, 60)
            doc.text('Data', margin + 210, 60)
            
            doc.line(margin, 65, pageWidth - margin, 65)
            
            yInscricoes = 75
          }
          
          // Zebra-striping (fundo cinza em linhas pares)
          if (index % 2 === 1) {
            doc.setFillColor(242, 242, 242)
            doc.rect(margin, yInscricoes - 3, pageWidth - 2 * margin, 8, 'F')
          }
          
          // CPF - Priorizar CPF real, se não tiver, usar ID como fallback
          const cpf = inscricao.cpf || inscricao.id
          doc.text(cpf?.substring(0, 14) || '', margin, yInscricoes)
          
          // Nome - Mais espaço para evitar corte
          const nome = inscricao.nome || ''
          if (!nome) {
            console.log('Nome não encontrado para inscrição:', inscricao.id)
          }
          doc.text(nome.substring(0, 30) || 'N/A', margin + 40, yInscricoes)
          
          // Email - Garantir que seja exibido (com debug)
          const email = inscricao.email || ''
          if (!email) {
            console.log('Email não encontrado para inscrição:', inscricao.id, inscricao.nome)
          }
          doc.text(email.substring(0, 25) || 'N/A', margin + 110, yInscricoes)
          
          // Status
          doc.text(inscricao.status || '', margin + 170, yInscricoes)
          
          // Data
          doc.text(inscricao.created ? new Date(inscricao.created).toLocaleDateString('pt-BR') : '', margin + 210, yInscricoes)
          yInscricoes += 10
        })
        
        // Rodapé da última página de inscrições
        doc.setFontSize(9)
        doc.text(`Página ${currentPage}`, pageWidth / 2, pageHeight - 20, { align: 'center' })
        doc.text('Desenvolvido por M24', pageWidth - margin, pageHeight - 20, { align: 'right' })
        
        // PÁGINA 6 - TABELAS DE PEDIDOS (TODOS OS DADOS)
        doc.addPage()
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text('Tabelas de Pedidos', margin, 40)
        
        // Informação sobre inclusão completa de dados
        doc.setFontSize(10)
        doc.setFont('helvetica', 'italic')
        doc.text('* Todos os pedidos serão incluídos para conferência completa', margin, 55)
        
        // Tabela de Pedidos Detalhados com paginação automática
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Pedidos Detalhados', margin, 75)
        
        // Cabeçalho da tabela
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('CPF', margin, 95)
        doc.text('Produto', margin + 50, 95)
        doc.text('Status', margin + 120, 95)
        doc.text('Valor', margin + 160, 95)
        doc.text('Data', margin + 200, 95)
        
        // Linha separadora
        doc.line(margin, 100, pageWidth - margin, 100)
        
        // Dados dos pedidos com paginação automática - TODOS OS DADOS
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        let yPedidos = 110
        let currentPagePedidos = currentPage + 1
        // Calcular quantos itens cabem por página (espaço para cabeçalho + margem)
        let itemsPerPagePedidos = Math.floor((pageHeight - 140) / 10) // Margem maior para garantir espaço
        
        // IMPORTANTE: Incluir TODOS os pedidos sem limitação
        pedidos.forEach((pedido, index) => {
          // Verificar se precisa de nova página (margem de segurança)
          if (yPedidos > pageHeight - 50) {
            // Adicionar rodapé da página atual
            doc.setFontSize(9)
            doc.text(`Página ${currentPagePedidos}`, pageWidth / 2, pageHeight - 20, { align: 'center' })
            doc.text('Desenvolvido por M24', pageWidth - margin, pageHeight - 20, { align: 'right' })
            
            // Nova página
            doc.addPage()
            currentPagePedidos++
            
            // Repetir cabeçalho na nova página (continuação)
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text('Pedidos Detalhados (continuação)', margin, 40)
            
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text('CPF', margin, 60)
            doc.text('Produto', margin + 50, 60)
            doc.text('Status', margin + 120, 60)
            doc.text('Valor', margin + 160, 60)
            doc.text('Data', margin + 200, 60)
            
            doc.line(margin, 65, pageWidth - margin, 65)
            
            yPedidos = 75
          }
          
          // Zebra-striping (fundo cinza em linhas pares)
          if (index % 2 === 1) {
            doc.setFillColor(242, 242, 242)
            doc.rect(margin, yPedidos - 3, pageWidth - 2 * margin, 8, 'F')
          }
          
          // Buscar CPF através da inscrição
          const inscricaoCliente = inscricoes.find(i => i.id === pedido.id_inscricao)
          const cpfCliente = inscricaoCliente?.cpf || inscricaoCliente?.id || pedido.id_inscricao
          
          doc.text(cpfCliente?.substring(0, 14) || '', margin, yPedidos)
          
          // Buscar informações dos produtos (nome e tamanho)
          let produtoInfo = ''
          // pedido.produto é sempre string[] no tipo Pedido
          produtoInfo = pedido.produto.map(prodId => {
            const produto = produtos.find(p => p.id === prodId)
            if (produto) {
              const tamanho = pedido.tamanho ? ` (${pedido.tamanho})` : ''
              return `${produto.nome}${tamanho}`
            }
            return prodId
          }).join(', ')
          doc.text(produtoInfo.substring(0, 25) || '', margin + 50, yPedidos)
          doc.text(pedido.status || '', margin + 120, yPedidos)
          // Tratar valor do pedido de forma mais robusta
          let valorFormatado = '0.00'
          
          // Tentar obter valor do expand primeiro, depois do campo direto
          const valorPedido = pedido.expand?.pedido?.valor || pedido.valor
          
          if (valorPedido) {
            if (typeof valorPedido === 'string') {
              const valorNumerico = parseFloat(valorPedido)
              if (!isNaN(valorNumerico)) {
                valorFormatado = valorNumerico.toFixed(2)
              } else {
                console.warn('Valor inválido encontrado:', valorPedido, 'para pedido ID:', pedido.id)
              }
            } else if (typeof valorPedido === 'number') {
              valorFormatado = valorPedido.toFixed(2)
            }
          } else {
            console.warn('Valor nulo/undefined para pedido ID:', pedido.id)
          }
          doc.text(`R$ ${valorFormatado}`, margin + 160, yPedidos)
          doc.text(pedido.created ? new Date(pedido.created).toLocaleDateString('pt-BR') : '', margin + 200, yPedidos)
          yPedidos += 10
        })
        
        // Rodapé da última página de pedidos
        doc.setFontSize(9)
        doc.text(`Página ${currentPagePedidos}`, pageWidth / 2, pageHeight - 20, { align: 'center' })
        doc.text('Desenvolvido por M24', pageWidth - margin, pageHeight - 20, { align: 'right' })
        
        // Calcular número total de páginas (sem metodologia)
        const totalPages = currentPagePedidos
        
        // Nome do arquivo baseado no contexto
        let fileName = 'relatorio-executivo.pdf'
        if (isRelatorios) {
          fileName = 'relatorio-analise-filtrada.pdf'
        } else if (isLider) {
          fileName = 'relatorio-lideranca.pdf'
        }
        
        // Salvar o PDF
        doc.save(fileName)
        
        // Restaurar botão
        if (button) {
          button.innerHTML = originalText
          button.disabled = false
        }
      })
      .catch((error) => {
        console.error('Erro ao gerar PDF:', error)
        alert('Erro ao gerar PDF. Verifique o console para mais detalhes.')
        
        // Restaurar botão em caso de erro
        if (button) {
          button.innerHTML = originalText
          button.disabled = false
        }
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

  // Verificar se há dados para exibir
  const hasData = totalInscricoesFiltradas > 0 || totalPedidosFiltrados > 0

  return (
    <>
      {/* Empty State */}
      {!hasData && (
        <div className="card text-center py-12 mb-6">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Não há dados para os filtros selecionados. Tente ajustar os critérios de busca.
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              🔄 Recarregar Dados
            </button>
          </div>
        </div>
      )}

            {/* Conteúdo principal - só exibe se há dados */}
      {hasData && (
        <>
          {/* Seção: Resumo Geral */}
          <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          📊 Resumo Geral
        </h2>
        
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="card text-center border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
            <div className="flex justify-center items-center gap-2 mb-2">
              <span className="text-2xl">📥</span>
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
              {totalInscricoesFiltradas}
            </p>
          </div>

          <div className="card text-center border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-gray-800">
            <div className="flex justify-center items-center gap-2 mb-2">
              <span className="text-2xl">💳</span>
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
              {totalPedidosFiltrados}
            </p>
          </div>

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
              R$ {valorTotalConfirmado.toFixed(2)}
            </p>
          </div>
        </div>
      </div>



      {/* Seção: Status das Inscrições */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          📥 Status das Inscrições
        </h2>
        
        <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 mb-6">
          {[
            { status: 'pendente', icon: '⏳', color: 'orange', bg: 'from-orange-50 to-white', darkBg: 'from-orange-900/20 to-gray-800' },
            { status: 'confirmado', icon: '✅', color: 'green', bg: 'from-green-50 to-white', darkBg: 'from-green-900/20 to-gray-800' },
            { status: 'cancelado', icon: '❌', color: 'red', bg: 'from-red-50 to-white', darkBg: 'from-red-900/20 to-gray-800' }
          ].map(({ status, icon, color, bg, darkBg }) => (
            <div key={status} className={`card text-center border-l-4 border-${color}-500 bg-gradient-to-r ${bg} dark:${darkBg}`}>
              <div className="flex justify-center items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </h3>
              </div>
              <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>
                {statusInscricoes[status] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Seção: Status dos Pedidos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          💳 Status dos Pedidos
        </h2>
        
        <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2 mb-6">
          {[
            { status: 'pendente', icon: '⏳', color: 'orange', bg: 'from-orange-50 to-white', darkBg: 'from-orange-900/20 to-gray-800' },
            { status: 'pago', icon: '✅', color: 'green', bg: 'from-green-50 to-white', darkBg: 'from-green-900/20 to-gray-800' },
            { status: 'vencido', icon: '⚠️', color: 'yellow', bg: 'from-yellow-50 to-white', darkBg: 'from-yellow-900/20 to-gray-800' },
            { status: 'cancelado', icon: '❌', color: 'red', bg: 'from-red-50 to-white', darkBg: 'from-red-900/20 to-gray-800' }
          ].map(({ status, icon, color, bg, darkBg }) => (
            <div key={status} className={`card text-center border-l-4 border-${color}-500 bg-gradient-to-r ${bg} dark:${darkBg}`}>
              <div className="flex justify-center items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </h3>
              </div>
              <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>
                {statusPedidos[status] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Exportação - Final da Página */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold dark:text-gray-100">
              📊 Exportar Relatórios
            </h3>
          </div>
          
          {/* Dropdown de Exportação */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium">
              <Download className="w-4 h-4" />
              Exportar
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Menu Dropdown */}
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <Tippy content="Relatório completo com todos os dados e estatísticas">
                  <button
                    onClick={handleExportComplete}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">📊</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Relatório Completo</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">XLSX - Todos os dados</div>
                    </div>
                  </button>
                </Tippy>
                
                <Tippy content="Apenas dados das inscrições">
                  <button
                    onClick={handleExportInscricoes}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">📥</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Inscrições</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">XLSX - Dados de inscrições</div>
                    </div>
                  </button>
                </Tippy>
                
                <Tippy content="Apenas dados dos pedidos">
                  <button
                    onClick={handleExportPedidos}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">💳</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Pedidos</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">XLSX - Dados de pedidos</div>
                    </div>
                  </button>
                </Tippy>
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                
                <Tippy content="Relatório em formato PDF para impressão">
                  <button
                    onClick={handleExportPDF}
                    data-pdf-button
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">📄</span>
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
      </div>
        </>
      )}
    </>
  )
}
