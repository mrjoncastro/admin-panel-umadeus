import '../globals.css'
import LayoutWrapper from '@/components/templates/LayoutWrapper'

export default function RecuperarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="text-platinum font-sans">
      <LayoutWrapper>{children}</LayoutWrapper>
    </div>
  )
}

