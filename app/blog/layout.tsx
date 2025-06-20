import '../globals.css'
import LayoutWrapper from '@/components/templates/LayoutWrapper'

export const metadata = {
  title: 'UMADEUS Blog',
  description: 'Artigos e notícias da UMADEUS',
}

export default function BlogLayout({
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
