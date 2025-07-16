'use client'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import PedidoAvulsoForm from '@/components/organisms/PedidoAvulsoForm'

export default function NovoPedidoPage() {
  const { authChecked } = useAuthGuard(['lider'])

  if (!authChecked) {
    return <LoadingOverlay show={true} text="Carregando..." />
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h2 className="heading mb-4">Novo Pedido Avulso</h2>
      <PedidoAvulsoForm />
    </main>
  )
}
