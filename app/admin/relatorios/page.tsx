'use client'

import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useRef, useState } from 'react'
import type { Inscricao, Pedido } from '@/types'
import DashboardAnalytics from '../components/DashboardAnalytics'
import DashboardResumo from '../dashboard/components/DashboardResumo'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import { fetchAllPages } from '@/lib/utils/fetchAllPages'

export default function RelatoriosPage() {
  const { user, authChecked } = useAuthGuard(['coordenador', 'lider'])
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [totalInscricoes, setTotalInscricoes] = useState(0)
  const [totalPedidos, setTotalPedidos] = useState(0)
  const [filtroStatus, setFiltroStatus] = useState('pago')
  const [filtroInscricoes, setFiltroInscricoes] = useState('pendente')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)

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
        } else {
          setInscricoes(allInscricoes.filter((i) => i.campo === campoId))
          setPedidos(allPedidos.filter((p) => p.expand?.campo?.id === campoId))
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
          <DashboardResumo
            inscricoes={inscricoes}
            pedidos={pedidos}
            filtroStatus={filtroStatus}
            filtroInscricoes={filtroInscricoes}
            setFiltroInscricoes={setFiltroInscricoes}
            setFiltroStatus={setFiltroStatus}
            totalInscricoes={totalInscricoes}
            totalPedidos={totalPedidos}
          />
          <DashboardAnalytics inscricoes={inscricoes} pedidos={pedidos} />
        </>
      )}
    </main>
  )
}
