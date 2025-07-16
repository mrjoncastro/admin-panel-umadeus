'use client'

import LayoutWrapper from '@/components/templates/LayoutWrapper'
import { generateRelatorioPdf } from '@/lib/report/generateRelatorioPdf'
import { useToast } from '@/lib/context/ToastContext'

export default function RelatorioPage() {
  const { showError, showSuccess } = useToast()

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
    <LayoutWrapper>
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

        <button onClick={handleDownload} className="btn btn-primary px-3 py-1 mt-6">
          Baixar PDF
        </button>
      </div>
    </LayoutWrapper>
  )
}
