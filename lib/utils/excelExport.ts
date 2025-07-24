import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Inscricao, Pedido } from '../../types'

export interface ExportData {
  inscricoes: Inscricao[]
  pedidos: Pedido[]
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

  // Preparar dados das inscrições
  const inscricoesData = [
    [
      'ID',
      'Nome',
      'Telefone',
      'Status',
      'Campo',
      'Tamanho',
      'Gênero',
      'Data Nascimento',
      'Data Criação',
      'Criado Por',
    ],
    ...data.inscricoes.map((inscricao) => [
      inscricao.id,
      inscricao.nome,
      inscricao.telefone,
      inscricao.status,
      inscricao.expand?.campo?.nome || 'N/A',
      inscricao.tamanho || 'N/A',
      inscricao.genero || 'N/A',
      inscricao.data_nascimento || 'N/A',
      inscricao.created ? new Date(inscricao.created).toLocaleDateString('pt-BR') : 'N/A',
      inscricao.expand?.criado_por?.nome || 'N/A',
    ]),
  ]

  // Criar planilha das inscrições
  const inscricoesSheet = XLSX.utils.aoa_to_sheet(inscricoesData)
  XLSX.utils.book_append_sheet(workbook, inscricoesSheet, 'Inscrições')

  // Preparar dados dos pedidos
  const pedidosData = [
    [
      'ID',
      'ID Inscrição',
      'Email',
      'Status',
      'Valor (R$)',
      'Campo',
      'Produto',
      'Tamanho',
      'Cor',
      'Gênero',
      'Canal',
      'Data Criação',
    ],
    ...data.pedidos.map((pedido) => [
      pedido.id,
      pedido.id_inscricao,
      pedido.email,
      pedido.status,
      Number(pedido.valor || 0).toFixed(2),
      pedido.expand?.campo?.nome || 'N/A',
      Array.isArray(pedido.expand?.produto) 
        ? pedido.expand?.produto[0]?.nome || 'N/A'
        : pedido.expand?.produto?.nome || 'N/A',
      pedido.tamanho || 'N/A',
      pedido.cor || 'N/A',
      pedido.genero || 'N/A',
      pedido.canal || 'N/A',
      pedido.created ? new Date(pedido.created).toLocaleDateString('pt-BR') : 'N/A',
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

  const finalFilename = filename || `relatorio_geral_${new Date().toISOString().split('T')[0]}.xlsx`
  saveAs(blob, finalFilename)
}

export const exportInscricoesToExcel = (inscricoes: Inscricao[], filename?: string) => {
  const workbook = XLSX.utils.book_new()

  const data = [
    [
      'ID',
      'Nome',
      'Telefone',
      'Status',
      'Campo',
      'Tamanho',
      'Gênero',
      'Data Nascimento',
      'Data Criação',
      'Criado Por',
    ],
    ...inscricoes.map((inscricao) => [
      inscricao.id,
      inscricao.nome,
      inscricao.telefone,
      inscricao.status,
      inscricao.expand?.campo?.nome || 'N/A',
      inscricao.tamanho || 'N/A',
      inscricao.genero || 'N/A',
      inscricao.data_nascimento || 'N/A',
      inscricao.created ? new Date(inscricao.created).toLocaleDateString('pt-BR') : 'N/A',
      inscricao.expand?.criado_por?.nome || 'N/A',
    ]),
  ]

  const sheet = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(workbook, sheet, 'Inscrições')

  const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const finalFilename = filename || `inscricoes_${new Date().toISOString().split('T')[0]}.xlsx`
  saveAs(blob, finalFilename)
}

export const exportPedidosToExcel = (pedidos: Pedido[], filename?: string) => {
  const workbook = XLSX.utils.book_new()

  const data = [
    [
      'ID',
      'ID Inscrição',
      'Email',
      'Status',
      'Valor (R$)',
      'Campo',
      'Produto',
      'Tamanho',
      'Cor',
      'Gênero',
      'Canal',
      'Data Criação',
    ],
    ...pedidos.map((pedido) => [
      pedido.id,
      pedido.id_inscricao,
      pedido.email,
      pedido.status,
      Number(pedido.valor || 0).toFixed(2),
      pedido.expand?.campo?.nome || 'N/A',
      Array.isArray(pedido.expand?.produto) 
        ? pedido.expand?.produto[0]?.nome || 'N/A'
        : pedido.expand?.produto?.nome || 'N/A',
      pedido.tamanho || 'N/A',
      pedido.cor || 'N/A',
      pedido.genero || 'N/A',
      pedido.canal || 'N/A',
      pedido.created ? new Date(pedido.created).toLocaleDateString('pt-BR') : 'N/A',
    ]),
  ]

  const sheet = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(workbook, sheet, 'Pedidos')

  const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const finalFilename = filename || `pedidos_${new Date().toISOString().split('T')[0]}.xlsx`
  saveAs(blob, finalFilename)
}