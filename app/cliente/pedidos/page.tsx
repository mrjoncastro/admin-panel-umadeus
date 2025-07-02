import PedidosTable from '../components/PedidosTable'
import Link from 'next/link'

export default function PedidosPage() {
  return (
    <div className="space-y-4">
      <PedidosTable />
      <div className="text-center text-sm">
        <p>Não recebeu o email de pagamento?</p>
        <Link
          href="/recuperar"
          className="text-purple-600 hover:underline"
        >
          Recupere agora!
        </Link>
      </div>
    </div>
  )
}
