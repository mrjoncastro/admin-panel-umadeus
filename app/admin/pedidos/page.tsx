'use client'

import { useEffect, useState } from 'react'
import { fetchAllPages } from '@/lib/utils/fetchAllPages'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import type { Pedido, Produto } from '@/types'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import ModalEditarPedido from './componentes/ModalEditarPedido'
import { useToast } from '@/lib/context/ToastContext'
import Link from 'next/link'
import { getNomeCliente } from '@/utils/getNomeCliente'

const PER_PAGE = 50

export default function PedidosPage() {
  const { user, authChecked } = useAuthGuard(['coordenador', 'lider'])

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroCampo, setFiltroCampo] = useState('')
  const [buscaGlobal, setBuscaGlobal] = useState('')
  const [ordem, setOrdem] = useState<'asc' | 'desc'>('desc')
  const [ordenarPor, setOrdenarPor] = useState<'data' | 'alfabetica'>('data')
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(
    null,
  )
  const { showError, showSuccess } = useToast()
  const placeholderBusca =
    user?.role === 'coordenador'
      ? 'Buscar por produto, email, nome ou campo'
      : 'Buscar por nome ou email'

  useEffect(() => {
    setPagina(1)
  }, [buscaGlobal, filtroCampo])

  useEffect(() => {
    if (!authChecked || !user) return

    const fetchPedidos = async () => {
      setLoading(true)
      try {
        const baseFiltro = `cliente='${user.cliente}'`
        const filtro =
          user.role === 'coordenador'
            ? baseFiltro
            : `campo = "${user.campo}" && ${baseFiltro}`

        const params = new URLSearchParams({
          page: '1',
          perPage: String(PER_PAGE),
          filter: filtro,
          sort: `${ordem === 'desc' ? '-' : ''}created`,
        })
        if (filtroStatus) {
          params.set('status', filtroStatus)
        }

        const baseUrl = `/api/pedidos?${params.toString()}`
        const res = await fetch(baseUrl, {
          credentials: 'include',
        })
        const data = await res.json()

        const rest = await fetchAllPages<{ items?: Pedido[] } | Pedido>(
          baseUrl,
          data.totalPages ?? 1,
        )

        let rawItems: Pedido[] = Array.isArray(data.items) ? data.items : data
        rawItems = rawItems.concat(
          rest.flatMap((r) =>
            Array.isArray((r as { items?: Pedido[] }).items)
              ? (r as { items: Pedido[] }).items
              : (r as Pedido),
          ),
        )

        const unique = Array.from(
          new Map(rawItems.map((p) => [p.id, p])).values(),
        )
        setPedidos(unique)
        setTotalPaginas(Math.ceil(unique.length / PER_PAGE) || 1)
      } catch (err) {
        console.error('Erro ao carregar pedidos', err)
        showError('Erro ao carregar pedidos')
      } finally {
        setLoading(false)
      }
    }

    fetchPedidos()
  }, [pagina, ordem, user, authChecked, showError, filtroStatus])

  const pedidosFiltrados = pedidos.filter((p) => {
    const matchStatus = filtroStatus === '' || p.status === filtroStatus
    const matchCampo =
      filtroCampo === '' ||
      p.expand?.campo?.nome?.toLowerCase().includes(filtroCampo.toLowerCase())
    const produtoStr = Array.isArray(p.expand?.produto)
      ? p.expand.produto.map((prod: Produto) => prod.nome).join(', ')
      : (p.expand?.produto as Produto | undefined)?.nome ||
        (Array.isArray(p.produto) ? p.produto.join(', ') : (p.produto ?? ''))

    const matchBuscaGlobal =
      buscaGlobal === '' ||
      produtoStr.toLowerCase().includes(buscaGlobal.toLowerCase()) ||
      p.email.toLowerCase().includes(buscaGlobal.toLowerCase()) ||
      p.expand?.campo?.nome
        ?.toLowerCase()
        .includes(buscaGlobal.toLowerCase()) ||
      getNomeCliente(p).toLowerCase().includes(buscaGlobal.toLowerCase()) ||
      p.expand?.id_inscricao?.cpf
        ?.toLowerCase()
        .includes(buscaGlobal.toLowerCase())

    return matchStatus && matchCampo && matchBuscaGlobal
  })

  useEffect(() => {
    const total = Math.ceil(pedidosFiltrados.length / PER_PAGE) || 1
    setTotalPaginas(total)
  }, [pedidosFiltrados])

  const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => {
    if (ordenarPor === 'alfabetica') {
      const nomeA = getNomeCliente(a).toLowerCase()
      const nomeB = getNomeCliente(b).toLowerCase()
      return ordem === 'asc'
        ? nomeA.localeCompare(nomeB)
        : nomeB.localeCompare(nomeA)
    }
    const dataA = new Date(a.created || 0).getTime()
    const dataB = new Date(b.created || 0).getTime()
    return ordem === 'asc' ? dataA - dataB : dataB - dataA
  })

  const exportarPDF = async () => {
    if (!user) return

    const baseFiltro = `cliente='${user.cliente}'`
    const filtro =
      user.role === 'coordenador'
        ? baseFiltro
        : `campo = "${user.campo}" && ${baseFiltro}`

    const params = new URLSearchParams({
      page: '1',
      perPage: String(PER_PAGE),
      filter: filtro,
      sort: `${ordem === 'desc' ? '-' : ''}created`,
    })

    const primeiro = await fetch(`/api/pedidos?${params.toString()}`, {
      credentials: 'include',
    })
    const res: { items: Pedido[]; totalPages?: number } = await primeiro.json()
    let todos = Array.isArray(res.items)
      ? res.items
      : (res as unknown as Pedido[])

    for (let p = 2; p <= (res.totalPages ?? 1); p++) {
      params.set('page', String(p))
      const r = await fetch(`/api/pedidos?${params.toString()}`, {
        credentials: 'include',
      })
      const pj: { items: Pedido[] } = await r.json()
      todos = todos.concat(pj.items)
    }

    const pedidosFiltradosPdf = todos.filter((p) => {
      const matchStatus = filtroStatus === '' || p.status === filtroStatus
      const matchCampo =
        filtroCampo === '' ||
        p.expand?.campo?.nome?.toLowerCase().includes(filtroCampo.toLowerCase())
      const produtoStr = Array.isArray(p.expand?.produto)
        ? p.expand.produto.map((prod: Produto) => prod.nome).join(', ')
        : (p.expand?.produto as Produto | undefined)?.nome ||
          (Array.isArray(p.produto) ? p.produto.join(', ') : (p.produto ?? ''))

      const matchBuscaGlobal =
        buscaGlobal === '' ||
        produtoStr.toLowerCase().includes(buscaGlobal.toLowerCase()) ||
        p.email.toLowerCase().includes(buscaGlobal.toLowerCase()) ||
        p.expand?.campo?.nome
          ?.toLowerCase()
          .includes(buscaGlobal.toLowerCase()) ||
        getNomeCliente(p).toLowerCase().includes(buscaGlobal.toLowerCase()) ||
        p.expand?.id_inscricao?.cpf
          ?.toLowerCase()
          .includes(buscaGlobal.toLowerCase())

      return matchStatus && matchCampo && matchBuscaGlobal
    })

    const pedidosOrdenadosPdf = [...pedidosFiltradosPdf].sort((a, b) => {
      if (ordenarPor === 'alfabetica') {
        const nomeA = getNomeCliente(a).toLowerCase()
        const nomeB = getNomeCliente(b).toLowerCase()
        return ordem === 'asc'
          ? nomeA.localeCompare(nomeB)
          : nomeB.localeCompare(nomeA)
      }
      const dataA = new Date(a.created || 0).getTime()
      const dataB = new Date(b.created || 0).getTime()
      return ordem === 'asc' ? dataA - dataB : dataB - dataA
    })

    const MARGINS = { top: 56.7, bottom: 56.7, left: 56.7, right: 56.7 }
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(
      'Relat\u00F3rio de Pedidos',
      doc.internal.pageSize.getWidth() / 2,
      MARGINS.top,
      {
        align: 'center',
      },
    )
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    const linhas = pedidosOrdenadosPdf.map((p) => [
      Array.isArray(p.expand?.produto)
        ? p.expand.produto.map((prod: Produto) => prod.nome).join(', ')
        : (p.expand?.produto as Produto | undefined)?.nome || p.produto,
      getNomeCliente(p) || '',
      p.email,
      p.tamanho || '',
      p.status,
      p.expand?.campo?.nome || '',
      p.canal || '',
      p.created?.split('T')[0] || '',
    ])

    autoTable(doc, {
      startY: MARGINS.top + 20,
      head: [
        [
          'Produto',
          'Nome',
          'Email',
          'Tamanho',
          'Status',
          'Campo',
          'Canal',
          'Data',
        ],
      ],
      body: linhas,
      theme: 'striped',
      headStyles: { fillColor: [217, 217, 217], halign: 'center' },
      styles: { fontSize: 8 },
      margin: MARGINS,
    })

    const dataHora = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    })
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(10)
      doc.text('Desenvolvido por M24 Tecnologia', MARGINS.left, pageHeight - 20)
      doc.text(
        `P\u00E1gina ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        pageHeight - 20,
        { align: 'center' },
      )
      doc.text(
        dataHora,
        doc.internal.pageSize.getWidth() - MARGINS.right,
        pageHeight - 20,
        { align: 'right' },
      )
    }

    doc.save('pedidos.pdf')
  }
  const statusBadge = {
    pendente: 'bg-yellow-100 text-yellow-800',
    aguardando_pagamento: 'bg-blue-100 text-blue-800',
    pago: 'bg-green-100 text-green-800',
    vencido: 'bg-red-200 text-red-800',
    cancelado: 'bg-red-100 text-red-800',
  }

  if (!authChecked || loading) {
    return <LoadingOverlay show={true} text="Carregando pedidos..." />
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading">Pedidos Recebidos</h2>
        <Link href="/admin/pedidos/novo" className="btn btn-primary">
          + Novo Pedido
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder={placeholderBusca}
          value={buscaGlobal}
          onChange={(e) => {
            setBuscaGlobal(e.target.value)
            setPagina(1)
          }}
          className="flex-1 md:flex-none border rounded px-4 py-2 text-sm w-full md:w-64 shadow-sm"
        />
        <select
          value={filtroStatus}
          onChange={(e) => {
            setFiltroStatus(e.target.value)
            setPagina(1)
          }}
          className="border rounded px-4 py-2 text-sm bg-white shadow-sm"
        >
          <option value="">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="vencido">Vencido</option>
          <option value="cancelado">Cancelado</option>
        </select>
        {user?.role === 'coordenador' && (
          <input
            type="text"
            placeholder="Filtrar por campo"
            value={filtroCampo}
            onChange={(e) => {
              setFiltroCampo(e.target.value)
              setPagina(1)
            }}
            className="border rounded px-4 py-2 text-sm w-full md:w-60 shadow-sm"
          />
        )}
        <select
          value={ordenarPor}
          onChange={(e) =>
            setOrdenarPor(e.target.value as 'data' | 'alfabetica')
          }
          className="border rounded px-4 py-2 text-sm bg-white shadow-sm"
        >
          <option value="data">Data de criação</option>
          <option value="alfabetica">Ordem alfabética</option>
        </select>
        <button
          onClick={() => setOrdem(ordem === 'desc' ? 'asc' : 'desc')}
          className="btn btn-secondary"
        >
          {ordem === 'desc' ? '↓' : '↑'}
        </button>
        <button onClick={exportarPDF} className="btn btn-primary">
          PDF
        </button>
      </div>

      {/* Tabela */}
      {pedidosFiltrados.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum pedido encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="table-base">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Tamanho</th>
                <th>Status</th>
                <th>Campo</th>
                <th>Canal</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {pedidosOrdenados.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="font-medium">
                    {Array.isArray(pedido.expand?.produto)
                      ? pedido.expand?.produto
                          .map((p: Produto) => p.nome)
                          .join(', ')
                      : (pedido.expand?.produto as Produto | undefined)?.nome ||
                        (Array.isArray(pedido.produto)
                          ? pedido.produto.join(', ')
                          : pedido.produto)}
                  </td>
                  <td>{getNomeCliente(pedido) || '—'}</td>
                  <td>{pedido.email}</td>
                  <td>{pedido.tamanho || '—'}</td>
                  <td className="capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        statusBadge[pedido.status]
                      }`}
                    >
                      {pedido.status}
                    </span>
                    {(pedido.status === 'pendente' ||
                      pedido.status === 'vencido') &&
                    pedido.vencimento &&
                    new Date(pedido.vencimento) < new Date() ? (
                      <span className="ml-1 text-red-600">⚠️</span>
                    ) : null}
                  </td>
                  <td>{pedido.expand?.campo?.nome || '—'}</td>
                  <td className="text-xs font-medium">
                    {pedido.canal
                      ? pedido.canal.charAt(0).toUpperCase() +
                        pedido.canal.slice(1).toLowerCase()
                      : '—'}
                  </td>
                  <td className="space-x-3 text-right">
                    <button
                      onClick={() => setPedidoSelecionado(pedido)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Editar
                    </button>
                    {user?.role === 'coordenador' && (
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              'Tem certeza que deseja excluir este pedido?',
                            )
                          ) {
                            try {
                              await fetch(`/api/pedidos/${pedido.id}`, {
                                method: 'DELETE',
                                credentials: 'include',
                              })
                              setPedidos((prev) =>
                                prev.filter((p) => p.id !== pedido.id),
                              )
                              showSuccess('Pedido excluído')
                            } catch (e) {
                              console.error('Erro ao excluir:', e)
                              showError('Erro ao excluir pedido')
                            }
                          }
                        }}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edição */}
      {pedidoSelecionado && (
        <ModalEditarPedido
          pedido={pedidoSelecionado}
          disableStatus={user?.role === 'lider'}
          onClose={() => setPedidoSelecionado(null)}
          onSave={async (dadosAtualizados) => {
            try {
              const res = await fetch(`/api/pedidos/${pedidoSelecionado.id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAtualizados),
              })
              const atualizado = await res.json()
              setPedidos((prev) =>
                prev.map((p) =>
                  p.id === atualizado.id ? { ...p, ...atualizado } : p,
                ),
              )
              setPedidoSelecionado(null)
              showSuccess('Pedido atualizado')
            } catch (e) {
              console.error('Erro ao salvar edição:', e)
              showError('Erro ao salvar edição')
            }
          }}
        />
      )}

      {/* Paginação */}
      <div className="flex justify-between items-center mt-6 text-sm">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina((p) => Math.max(1, p - 1))}
          className="btn btn-secondary disabled:opacity-50"
        >
          Anterior
        </button>
        <span>
          Página {pagina} de {totalPaginas}
        </span>
        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          className="btn btn-secondary disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </main>
  )
}
