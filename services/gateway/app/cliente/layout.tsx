import '../globals.css'
import LayoutWrapper from '@/components/templates/LayoutWrapper'
import Sidebar from './components/Sidebar'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="text-platinum font-sans">
      <LayoutWrapper>
        <div className="flex flex-col md:flex-row gap-6 p-4 md:p-8">
          <Sidebar />
          <div className="flex-1">{children}</div>
        </div>
      </LayoutWrapper>
    </div>
  )
}
