'use client'

import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useRef, useState } from 'react'
import type { Inscricao, Pedido, Produto } from '@/types'
import DashboardAnalytics from '../components/DashboardAnalytics'
import DashboardResumo from '../dashboard/components/DashboardResumo'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import { fetchAllPages } from '@/lib/utils/fetchAllPages'

// Enhanced filtering interface
interface Filtros {
  status: string[]
  statusInscricoes: string[]
  produto: string[]
  campo: string[]
  periodo: string
  canal: string[]
  tamanho: string[]
  evento: string
}

export default function RelatoriosPage() {
  const { user, authChecked } = useAuthGuard(['coordenador', 'lider'])
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [campos, setCampos] = useState<{ id: string; nome: string }[]>([])
  const [totalInscricoes, setTotalInscricoes] = useState(0)
  const [totalPedidos, setTotalPedidos] = useState(0)
  const [filtroStatus, setFiltroStatus] = useState('pago')
  const [filtroInscricoes, setFiltroInscricoes] = useState('pendente')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)
  const [eventos, setEventos] = useState<{ id: string; titulo: string }[]>([])

  // Enhanced filters state
  const [filtros, setFiltros] = useState<Filtros>({
    status: [],
    statusInscricoes: [],
    produto: [],
    campo: [],
    periodo: 'todos',
    canal: [],
    tamanho: [],
    evento: 'todos',
  })

  // Filtered data based on active filters
  const [inscricoesFiltradas, setInscricoesFiltradas] = useState<Inscricao[]>(
    [],
  )
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([])

  // Apply filters to data
  useEffect(() => {
    let inscricoesResult = [...inscricoes]
    let pedidosResult = [...pedidos]

    // Filter inscricoes
    if (filtros.statusInscricoes.length > 0) {
      inscricoesResult = inscricoesResult.filter(
        (i) => i.status && filtros.statusInscricoes.includes(i.status),
      )
    }
    if (filtros.produto.length > 0) {
      inscricoesResult = inscricoesResult.filter(
        (i) => i.produto && filtros.produto.includes(i.produto),
      )
    }
    if (filtros.campo.length > 0) {
      inscricoesResult = inscricoesResult.filter(
        (i) => i.campo && filtros.campo.includes(i.campo),
      )
    }
    if (filtros.tamanho.length > 0) {
      inscricoesResult = inscricoesResult.filter(
        (i) => i.tamanho && filtros.tamanho.includes(i.tamanho),
      )
    }
    if (filtros.periodo !== 'todos') {
      const now = new Date()
      const filterDate = new Date()

      switch (filtros.periodo) {
        case 'ultima_semana':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'ultimo_mes':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'ultimos_3_meses':
          filterDate.setMonth(now.getMonth() - 3)
          break
        case 'ultimo_ano':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }

      if (filtros.periodo !== 'todos') {
        inscricoesResult = inscricoesResult.filter(
          (i) => i.created && new Date(i.created) >= filterDate,
        )
      }
    }

    // Filter pedidos
    if (filtros.status.length > 0) {
      pedidosResult = pedidosResult.filter((p) =>
        filtros.status.includes(p.status),
      )
    }
    if (filtros.produto.length > 0) {
      pedidosResult = pedidosResult.filter((p) => {
        if (Array.isArray(p.produto)) {
          return p.produto.some((prod) => filtros.produto.includes(prod))
        }
        // Check expanded produto
        if (p.expand?.produto) {
          if (Array.isArray(p.expand.produto)) {
            return p.expand.produto.some((prod: Produto) =>
              filtros.produto.includes(prod.id),
            )
          } else {
            return filtros.produto.includes(p.expand.produto.id)
          }
        }
        return false
      })
    }
    if (filtros.campo.length > 0) {
      pedidosResult = pedidosResult.filter(
        (p) => p.campo && filtros.campo.includes(p.campo),
      )
    }
    if (filtros.tamanho.length > 0) {
      pedidosResult = pedidosResult.filter(
        (p) => p.tamanho && filtros.tamanho.includes(p.tamanho),
      )
    }
    if (filtros.canal.length > 0) {
      pedidosResult = pedidosResult.filter(
        (p) => p.canal && filtros.canal.includes(p.canal),
      )
    }
    if (filtros.periodo !== 'todos') {
      const now = new Date()
      const filterDate = new Date()

      switch (filtros.periodo) {
        case 'ultima_semana':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'ultimo_mes':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'ultimos_3_meses':
          filterDate.setMonth(now.getMonth() - 3)
          break
        case 'ultimo_ano':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }

      if (filtros.periodo !== 'todos') {
        pedidosResult = pedidosResult.filter(
          (p) => p.created && new Date(p.created) >= filterDate,
        )
      }
    }

    setInscricoesFiltradas(inscricoesResult)
    setPedidosFiltrados(pedidosResult)
  }, [inscricoes, pedidos, filtros])

  useEffect(() => {
    if (!authChecked || !user?.id || !user?.role) return
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        setError(null)
        const userRes = await fetch(`/admin/api/usuarios/${user.id}`, {
          credentials: 'include',
          signal,
        })
        if (!userRes.ok) {
          if (userRes.status === 401 || userRes.status === 403) {
            setError('403 - Acesso negado')
            return
          }
          throw new Error('Erro ao obter usuário')
        }
        const expandedUser = await userRes.json()

        const perPage = 50
        const filtroCliente = `cliente='${user.cliente}'`
        const params = new URLSearchParams({
          page: '1',
          perPage: String(perPage),
          filter: filtroCliente,
        })

        // Fetch inscricoes
        const insRes = await fetch(`/api/inscricoes?${params.toString()}`, {
          credentials: 'include',
          signal,
        }).then((r) => r.json())
        const insRest = await fetchAllPages<
          { items?: Inscricao[] } | Inscricao
        >(
          `/api/inscricoes?${params.toString()}`,
          insRes.totalPages ?? 1,
          signal,
        )
        let rawInscricoes = Array.isArray(insRes.items) ? insRes.items : insRes
        rawInscricoes = rawInscricoes.concat(
          insRest.flatMap((r) =>
            Array.isArray((r as { items?: Inscricao[] }).items)
              ? (r as { items: Inscricao[] }).items
              : (r as Inscricao),
          ),
        )

        // Fetch pedidos
        params.set('page', '1')
        const pedRes = await fetch(
          `/api/pedidos?${params.toString()}&expand=campo,produto`,
          {
            credentials: 'include',
            signal,
          },
        ).then((r) => r.json())
        const pedRest = await fetchAllPages<{ items?: Pedido[] } | Pedido>(
          `/api/pedidos?${params.toString()}&expand=campo,produto`,
          pedRes.totalPages ?? 1,
          signal,
        )
        let rawPedidos = Array.isArray(pedRes.items) ? pedRes.items : pedRes
        rawPedidos = rawPedidos.concat(
          pedRest.flatMap((r) =>
            Array.isArray((r as { items?: Pedido[] }).items)
              ? (r as { items: Pedido[] }).items
              : (r as Pedido),
          ),
        )

        // Fetch produtos for filter options
        const prodRes = await fetch(`/api/produtos`, {
          credentials: 'include',
          signal,
        }).then((r) => r.json())
        const produtos = Array.isArray(prodRes) ? prodRes : [prodRes]

        // Filtrar apenas produtos ativos
        const produtosAtivos = produtos.filter((p: any) => p.ativo === true)

        console.log('Produtos carregados:', produtosAtivos) // Debug log

        // Fetch campos for filter options
        const camposRes = await fetch(`/api/campos?${params.toString()}`, {
          credentials: 'include',
          signal,
        }).then((r) => r.json())
        const campos = Array.isArray(camposRes.items)
          ? camposRes.items
          : camposRes

        // Fetch eventos para o filtro
        const eventosRes = await fetch(`/api/eventos?${params.toString()}`, {
          credentials: 'include',
          signal,
        }).then((r) => r.json())
        const eventos = Array.isArray(eventosRes.items)
          ? eventosRes.items
          : eventosRes
        setEventos(eventos)

        setTotalInscricoes(rawInscricoes.length)
        setTotalPedidos(rawPedidos.length)

        if (!isMounted.current) return

        const campoId = expandedUser.expand?.campo?.id

        const allInscricoes: Inscricao[] = rawInscricoes.map(
          (r: Inscricao) => ({
            id: r.id,
            nome: r.nome,
            telefone: r.telefone,
            evento: r.expand?.evento?.titulo,
            status: r.status,
            created: r.created,
            campo: r.campo,
            tamanho: r.tamanho,
            produto: r.produto,
            genero: r.genero,
            data_nascimento: r.data_nascimento,
            criado_por: r.criado_por,
            expand: {
              campo: r.expand?.campo,
              criado_por: r.expand?.criado_por,
              pedido: r.expand?.pedido,
            },
          }),
        )

        const allPedidos: Pedido[] = rawPedidos.map((r: Pedido) => ({
          id: r.id,
          id_inscricao: r.id_inscricao,
          produto: r.produto,
          email: r.email,
          tamanho: r.tamanho,
          cor: r.cor,
          status: r.status,
          valor: r.valor,
          id_pagamento: r.id_pagamento,
          created: r.created,
          campo: r.campo,
          genero: r.genero,
          evento: r.expand?.evento?.titulo,
          data_nascimento: r.data_nascimento,
          responsavel: r.responsavel,
          canal: r.canal,
          expand: {
            campo: r.expand?.campo,
            criado_por: r.expand?.criado_por,
            produto: r.expand?.produto,
          },
        }))

        if (user.role === 'coordenador') {
          setInscricoes(allInscricoes)
          setPedidos(allPedidos)
          setProdutos(produtosAtivos)
          setCampos(campos)
        } else {
          setInscricoes(allInscricoes.filter((i) => i.campo === campoId))
          setPedidos(allPedidos.filter((p) => p.expand?.campo?.id === campoId))
          setProdutos(produtosAtivos)
          setCampos(campos.filter((c: { id: string }) => c.id === campoId))
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Erro no relatório:', err.message)
        }
        setError('Erro ao carregar relatório.')
      } finally {
        if (isMounted.current) setLoading(false)
      }
    }

    fetchData()
    return () => {
      isMounted.current = false
      controller.abort()
    }
  }, [authChecked, user?.id, user?.role, user?.cliente])

  const handleFiltroChange = (key: keyof Filtros, value: string) => {
    setFiltros((prev) => {
      if (key === 'periodo' || key === 'evento') {
        return {
          ...prev,
          [key]: value,
        }
      }

      const currentArray = prev[key] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value]

      return {
        ...prev,
        [key]: newArray,
      }
    })
  }

  const clearAllFilters = () => {
    setFiltros({
      status: [],
      statusInscricoes: [],
      produto: [],
      campo: [],
      periodo: 'todos',
      canal: [],
      tamanho: [],
      evento: 'todos',
    })
  }

  const produtosFiltrados =
    filtros.evento !== 'todos'
      ? produtos.filter((p: any) => p.evento_id === filtros.evento)
      : produtos

  return (
    <main className="min-h-screen p-4 md:p-6">
      {!authChecked || !user || loading ? (
        <LoadingOverlay show={true} text="Carregando relatório..." />
      ) : error ? (
        <div className="min-h-screen flex items-center justify-center">
          <h1 className="text-2xl font-semibold">{error}</h1>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center dark:text-gray-100">
            <h1 className="heading">Relatório Geral</h1>
            <p className="text-sm text-gray-700 mt-1 dark:text-gray-100">
              Exporte o resumo e métricas gerais em PDF ou XLSX.
            </p>
          </div>

          {/* Enhanced Filters Section */}
          <div className="card mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
                Filtros
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {/* Status do Pedido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Situação do Pedido
                  </label>
                  <div className="space-y-2">
                    {['pendente', 'pago', 'vencido', 'cancelado'].map(
                      (status) => (
                        <label key={status} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filtros.status.includes(status)}
                            onChange={() =>
                              handleFiltroChange('status', status)
                            }
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {status}
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                </div>

                {/* Status da Inscrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Situação da Inscrição
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'pendente', label: 'Pendente' },
                      {
                        value: 'aguardando_pagamento',
                        label: 'Aguardando Pagamento',
                      },
                      { value: 'confirmado', label: 'Confirmado' },
                      { value: 'cancelado', label: 'Cancelado' },
                    ].map((status) => (
                      <label key={status.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filtros.statusInscricoes.includes(
                            status.value,
                          )}
                          onChange={() =>
                            handleFiltroChange('statusInscricoes', status.value)
                          }
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {status.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Evento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Evento
                  </label>
                  <select
                    value={filtros.evento}
                    onChange={(e) =>
                      handleFiltroChange('evento', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="todos">Todos os eventos</option>
                    {eventos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Produto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tipo de Produto
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {produtosFiltrados.length > 0 ? (
                      produtosFiltrados.map((produto: any) => (
                        <label key={produto.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filtros.produto.includes(produto.id)}
                            onChange={() =>
                              handleFiltroChange('produto', produto.id)
                            }
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {produto.nome}
                          </span>
                        </label>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">
                        Nenhum produto disponível
                      </span>
                    )}
                  </div>
                </div>

                {/* Campo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Campo
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {campos.map((campo) => (
                      <label key={campo.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filtros.campo.includes(campo.id)}
                          onChange={() => handleFiltroChange('campo', campo.id)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {campo.nome}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Canal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Canal de Venda
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'loja', label: 'Loja' },
                      { value: 'inscricao', label: 'Inscrição' },
                    ].map((canal) => (
                      <label key={canal.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filtros.canal.includes(canal.value)}
                          onChange={() =>
                            handleFiltroChange('canal', canal.value)
                          }
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {canal.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Período */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Período
                  </label>
                  <select
                    value={filtros.periodo}
                    onChange={(e) =>
                      handleFiltroChange('periodo', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="todos">Todo o período</option>
                    <option value="ultima_semana">Última semana</option>
                    <option value="ultimo_mes">Último mês</option>
                    <option value="ultimos_3_meses">Últimos 3 meses</option>
                    <option value="ultimo_ano">Último ano</option>
                  </select>
                </div>

                {/* Tamanho */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tamanho da Camisa
                  </label>
                  <div className="space-y-2">
                    {['PP', 'P', 'M', 'G', 'GG'].map((tamanho) => (
                      <label key={tamanho} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filtros.tamanho.includes(tamanho)}
                          onChange={() =>
                            handleFiltroChange('tamanho', tamanho)
                          }
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {tamanho}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter actions */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {inscricoesFiltradas.length} inscrições e{' '}
                  {pedidosFiltrados.length} pedidos
                </div>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          <DashboardResumo
            inscricoes={inscricoesFiltradas}
            pedidos={pedidosFiltrados}
            filtroStatus={filtroStatus}
            filtroInscricoes={filtroInscricoes}
            setFiltroInscricoes={setFiltroInscricoes}
            setFiltroStatus={setFiltroStatus}
            totalInscricoes={totalInscricoes}
            totalPedidos={totalPedidos}
          />
          <DashboardAnalytics
            inscricoes={inscricoesFiltradas}
            pedidos={pedidosFiltrados}
          />
        </>
      )}
    </main>
  )
}
