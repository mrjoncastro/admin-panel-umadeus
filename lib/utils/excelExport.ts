import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Inscricao, Pedido, Produto } from '../../types'
import {
  getNomeCliente,
  getProdutoInfo,
  getEventoNome,
  formatCpf,
  getCpfCliente,
} from '@/lib/utils/pdfUtils'

export interface ExportData {
  inscricoes: Inscricao[]
  pedidos: Pedido[]
  produtos: Produto[]
  totalInscricoes: number
  totalPedidos: number
  valorTotal: number
}

export const exportToExcel = (data: ExportData, filename?: string) => {
  // Criar workbook
  const workbook = XLSX.utils.book_new()

  // Dados do resumo
  const resumoData = [
    ['Métrica', 'Valor'],
    ['Total de Inscrições', data.totalInscricoes],
    ['Total de Pedidos', data.totalPedidos],
    ['Valor Total (R$)', data.valorTotal.toFixed(2)],
  ]

  // Criar planilha do resumo
  const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData)
  XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo')

  const sortedInscricoes = [...data.inscricoes].sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR'),
  )

  const inscricoesData = [
    ['Nome', 'CPF', 'Evento', 'Campo', 'Produto', 'Status'],
    ...sortedInscricoes.map(inscricao => [
      inscricao.nome || 'Não informado',
      formatCpf(inscricao.cpf || inscricao.id),
      getEventoNome(inscricao.produto || '', data.produtos),
      inscricao.expand?.campo?.nome || inscricao.campo || 'Não informado',
      getProdutoInfo(inscricao.produto || '', data.produtos),
      inscricao.status || 'Não informado',
    ]),
  ]

  // Criar planilha das inscrições
  const inscricoesSheet = XLSX.utils.aoa_to_sheet(inscricoesData)
  XLSX.utils.book_append_sheet(workbook, inscricoesSheet, 'Inscrições')

  // Preparar dados dos pedidos
  const sortedPedidos = [...data.pedidos].sort((a, b) =>
    getNomeCliente(a).localeCompare(getNomeCliente(b), 'pt-BR'),
  )

  const pedidosData = [
    ['Nome', 'CPF', 'Campo', 'Produto', 'Tamanho', 'Canal', 'Status'],
    ...sortedPedidos.map(pedido => [
      getNomeCliente(pedido),
      formatCpf(getCpfCliente(pedido)),
      pedido.expand?.campo?.nome || pedido.campo || 'Não informado',
      pedido.produto
        .map(prodId => getProdutoInfo(prodId, data.produtos))
        .join(', '),
      pedido.tamanho || 'Não informado',
      pedido.canal || 'Não informado',
      pedido.status || 'Não informado',
    ]),
  ]

  // Criar planilha dos pedidos
  const pedidosSheet = XLSX.utils.aoa_to_sheet(pedidosData)
  XLSX.utils.book_append_sheet(workbook, pedidosSheet, 'Pedidos')

  // Estatísticas por campo
  const estatisticasCampo = data.inscricoes.reduce<
    Record<string, { inscricoes: number; pedidos: number; valor: number }>
  >((acc, inscricao) => {
    const campo = inscricao.expand?.campo?.nome || 'Sem campo'
    if (!acc[campo]) {
      acc[campo] = { inscricoes: 0, pedidos: 0, valor: 0 }
    }
    acc[campo].inscricoes++
    return acc
  }, {})

  // Adicionar dados dos pedidos às estatísticas
  data.pedidos.forEach((pedido) => {
    const campo = pedido.expand?.campo?.nome || 'Sem campo'
    if (!estatisticasCampo[campo]) {
      estatisticasCampo[campo] = { inscricoes: 0, pedidos: 0, valor: 0 }
    }
    estatisticasCampo[campo].pedidos++
    if (pedido.status === 'pago') {
      estatisticasCampo[campo].valor += Number(pedido.valor || 0)
    }
  })

  const estatisticasData = [
    ['Campo', 'Inscrições', 'Pedidos', 'Valor Total (R$)'],
    ...Object.entries(estatisticasCampo).map(([campo, stats]) => [
      campo,
      stats.inscricoes,
      stats.pedidos,
      stats.valor.toFixed(2),
    ]),
  ]

  // Criar planilha das estatísticas
  const estatisticasSheet = XLSX.utils.aoa_to_sheet(estatisticasData)
  XLSX.utils.book_append_sheet(workbook, estatisticasSheet, 'Estatísticas')

  // Gerar arquivo
  const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const finalFilename =
    filename || `relatorio_geral_${new Date().toISOString().split('T')[0]}.xlsx`
  saveAs(blob, finalFilename)
}

export const exportInscricoesToExcel = (
  inscricoes: Inscricao[],
  produtos: Produto[],
  filename?: string,
) => {
  const workbook = XLSX.utils.book_new()

  const sorted = [...inscricoes].sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR'),
  )

  const data = [
    ['Nome', 'CPF', 'Evento', 'Campo', 'Produto', 'Status'],
    ...sorted.map(inscricao => [
      inscricao.nome || 'Não informado',
      formatCpf(inscricao.cpf || inscricao.id),
      getEventoNome(inscricao.produto || '', produtos),
      inscricao.expand?.campo?.nome || inscricao.campo || 'Não informado',
      getProdutoInfo(inscricao.produto || '', produtos),
      inscricao.status || 'Não informado',
    ]),
  ]

  const sheet = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(workbook, sheet, 'Inscrições')

  const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const finalFilename =
    filename || `inscricoes_${new Date().toISOString().split('T')[0]}.xlsx`
  saveAs(blob, finalFilename)
}

export const exportPedidosToExcel = (
  pedidos: Pedido[],
  produtos: Produto[],
  filename?: string,
) => {
  const workbook = XLSX.utils.book_new()

  const sorted = [...pedidos].sort((a, b) =>
    getNomeCliente(a).localeCompare(getNomeCliente(b), 'pt-BR'),
  )

  const data = [
    ['Nome', 'CPF', 'Campo', 'Produto', 'Tamanho', 'Canal', 'Status'],
    ...sorted.map(pedido => [
      getNomeCliente(pedido),
      formatCpf(getCpfCliente(pedido)),
      pedido.expand?.campo?.nome || pedido.campo || 'Não informado',
      pedido.produto
        .map(prodId => getProdutoInfo(prodId, produtos))
        .join(', '),
      pedido.tamanho || 'Não informado',
      pedido.canal || 'Não informado',
      pedido.status || 'Não informado',
    ]),
  ]

  const sheet = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(workbook, sheet, 'Pedidos')

  const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const finalFilename =
    filename || `pedidos_${new Date().toISOString().split('T')[0]}.xlsx`
  saveAs(blob, finalFilename)
}
