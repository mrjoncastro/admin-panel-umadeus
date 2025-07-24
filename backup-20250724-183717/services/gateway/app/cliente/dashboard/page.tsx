import DashboardHeader from '../components/DashboardHeader'
import PedidosTable from '../components/PedidosTable'
import InscricoesTable from '../components/InscricoesTable'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <PedidosTable limit={5} />
      <InscricoesTable limit={5} />
    </div>
  )
}
