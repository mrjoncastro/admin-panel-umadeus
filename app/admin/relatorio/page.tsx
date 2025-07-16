'use client'

import LayoutWrapperAdmin from '@/components/templates/LayoutWrapperAdmin'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { generateRelatorioPdf } from '@/lib/report/generateRelatorioPdf'
import { generateAnalisePdf } from '@/lib/report/generateAnalisePdf'
import { useToast } from '@/lib/context/ToastContext'
import { useEffect, useState } from 'react'
import type { Pedido, Produto } from '@/types'
import { fetchAllPages } from '@/lib/utils/fetchAllPages'

export default function RelatorioPage() {
  const { user, authChecked } = useAuthGuard(['coordenador', 'lider'])
  const { showError, showSuccess } = useToast()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [analysis, setAnalysis] = useState<'produtoCampo' | 'produtoCanalCampo'>(
    'produtoCampo',
  )
  const [rows, setRows] = useState<(string | number)[][]>([])

  useEffect(() => {
    if (!authChecked || !user) return
    const controller = new AbortController()
    const signal = controller.signal
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          page: '1',
          perPage: '50',
          expand: 'campo,produto',
        })
        const baseUrl = `/api/pedidos?${params.toString()}`
        const res = await fetch(baseUrl, { credentials: 'include', signal })
        if (!res.ok) throw new Error('Erro ao obter pedidos')
        const data = await res.json()
        const rest = await fetchAllPages<
          { items?: Pedido[] } | Pedido
        >(baseUrl, data.totalPages ?? 1, signal)
        let lista: Pedido[] = Array.isArray(data.items)
          ? (data.items as Pedido[])
          : (data as Pedido[])
        lista = lista.concat(
          rest.flatMap((r) =>
            Array.isArray((r as { items?: Pedido[] }).items)
              ? ((r as { items: Pedido[] }).items)
              : (r as Pedido),
          ),
        )
        if (user.role === 'lider') {
          lista = lista.filter((p: Pedido) => p.expand?.campo?.id === user.campo)
        }
        setPedidos(lista)
      } catch (err) {
        console.error('Erro ao carregar pedidos', err)
        showError('Erro ao carregar pedidos')
      }
    }
    fetchData()
    return () => controller.abort()
  }, [authChecked, user, showError])

  useEffect(() => {
    const rowsCalc: (string | number)[][] = []
    if (analysis === 'produtoCampo') {
      const count: Record<string, Record<string, number>> = {}
      pedidos.forEach((p) => {
        const campo = p.expand?.campo?.nome || 'Sem campo'
        const produtosData = Array.isArray(p.expand?.produto)
          ? (p.expand?.produto as Produto[])
          : p.expand?.produto
            ? [(p.expand.produto as Produto)]
            : []
        if (produtosData.length === 0) {
          count[campo] = count[campo] || {}
          count[campo]['Sem produto'] = (count[campo]['Sem produto'] || 0) + 1
        } else {
          produtosData.forEach((pr: Produto) => {
            const nome = pr?.nome || 'Sem produto'
            count[campo] = count[campo] || {}
            count[campo][nome] = (count[campo][nome] || 0) + 1
          })
        }
      })
      Object.keys(count).forEach((campo) => {
        Object.keys(count[campo]).forEach((prod) => {
          rowsCalc.push([campo, prod, count[campo][prod]])
        })
      })
    } else {
      const count: Record<string, Record<string, Record<string, number>>> = {}
      pedidos.forEach((p) => {
        const campo = p.expand?.campo?.nome || 'Sem campo'
        const canal = p.canal || 'indefinido'
        const produtosData = Array.isArray(p.expand?.produto)
          ? (p.expand?.produto as Produto[])
          : p.expand?.produto
            ? [(p.expand.produto as Produto)]
            : []
        if (produtosData.length === 0) {
          count[campo] = count[campo] || {}
          count[campo]['Sem produto'] = count[campo]['Sem produto'] || {}
          count[campo]['Sem produto'][canal] =
            (count[campo]['Sem produto'][canal] || 0) + 1
        } else {
          produtosData.forEach((pr: Produto) => {
            const nome = pr?.nome || 'Sem produto'
            count[campo] = count[campo] || {}
            count[campo][nome] = count[campo][nome] || {}
            count[campo][nome][canal] =
              (count[campo][nome][canal] || 0) + 1
          })
        }
      })
      Object.keys(count).forEach((campo) => {
        Object.keys(count[campo]).forEach((prod) => {
          Object.keys(count[campo][prod]).forEach((canal) => {
            rowsCalc.push([campo, prod, canal, count[campo][prod][canal]])
          })
        })
      })
    }
    setRows(rowsCalc)
  }, [analysis, pedidos])

  const handleDownload = async () => {
    try {
      await generateRelatorioPdf()
      showSuccess('PDF gerado com sucesso.')
    } catch (err) {
      console.error('Erro ao gerar PDF', err)
      const message =
        err instanceof Error && err.message.includes('Tempo')
          ? 'Tempo esgotado ao gerar PDF.'
          : 'Não foi possível gerar o PDF. Tente novamente.'
      showError(message)
    }
  }

  return (
    <LayoutWrapperAdmin>
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <h1 className="text-3xl font-bold">Relatório</h1>

        <section>
          <h2 className="text-2xl font-semibold mt-4">Pedidos</h2>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              Coordenadores visualizam todos os pedidos, líderes apenas do seu
              campo e usuários somente os próprios.
            </li>
            <li>
              Os pedidos nascem do checkout ou da aprovação de inscrições e
              começam como <code>pendente</code>. Após confirmação do Asaas
              passam a <code>pago</code>.
            </li>
            <li>
              Se <code>confirma_inscricoes</code> estiver ativo, a inscrição
              precisa ser aprovada antes do pedido ser criado.
            </li>
            <li>
              Um pedido pode conter múltiplos produtos e registra valor total,
              status e vencimento.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-4">Produtos</h2>
          <ol className="list-decimal pl-5 space-y-1 mt-2">
            <li>
              <strong>Independente</strong> – vendido na loja (canal
              <code>loja</code>).
            </li>
            <li>
              <strong>Vinculado a evento sem aprovação</strong> – cria pedido
              automático com canal <code>inscricao</code>.
            </li>
            <li>
              <strong>Vinculado a evento com aprovação</strong> – a compra só é
              liberada após a inscrição ser aprovada.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-4">
            Campo <code>canal</code>
          </h2>
          <p className="mt-2">
            Define a origem do pedido. Usamos <code>loja</code> para produtos
            independentes, <code>inscricao</code> para pedidos vindos de
            inscrições e <code>avulso</code> quando o líder registra um pedido
            manualmente.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-4">Análises</h2>
          <div className="flex items-center gap-2 mt-2">
            <select
              value={analysis}
              onChange={(e) =>
                setAnalysis(
                  e.target.value as 'produtoCampo' | 'produtoCanalCampo',
                )
              }
              className="border rounded px-2 py-1"
            >
              <option value="produtoCampo">Produto x Campo</option>
              <option value="produtoCanalCampo">Produto x Canal x Campo</option>
            </select>
            <button
              onClick={async () => {
                try {
                  await generateAnalisePdf(
                    analysis === 'produtoCampo'
                      ? 'Análise Produto x Campo'
                      : 'Análise Produto x Canal x Campo',
                    analysis === 'produtoCampo'
                      ? ['Campo', 'Produto', 'Total']
                      : ['Campo', 'Produto', 'Canal', 'Total'],
                    rows,
                  )
                  showSuccess('PDF gerado com sucesso.')
                } catch (err) {
                  console.error('Erro ao gerar PDF', err)
                  const message =
                    err instanceof Error && err.message.includes('Tempo')
                      ? 'Tempo esgotado ao gerar PDF.'
                      : 'Não foi possível gerar o PDF. Tente novamente.'
                  showError(message)
                }
              }}
              className="btn btn-primary px-3 py-1"
            >
              Gerar PDF
            </button>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="table-auto border-collapse w-full text-sm">
              <thead>
                <tr>
                  {(
                    analysis === 'produtoCampo'
                      ? ['Campo', 'Produto', 'Total']
                      : ['Campo', 'Produto', 'Canal', 'Total']
                  ).map((h) => (
                    <th key={h} className="border px-2 py-1 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx}>
                    {r.map((c, i) => (
                      <td key={i} className="border px-2 py-1">{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <button onClick={handleDownload} className="btn btn-primary px-3 py-1 mt-6">
          Baixar PDF
        </button>
      </div>
    </LayoutWrapperAdmin>
  )
}
