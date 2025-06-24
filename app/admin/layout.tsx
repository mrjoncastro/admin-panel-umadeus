// app/layout.tsx
import '@/app/globals.css'
import LayoutWrapper from '@/components/templates/LayoutWrapperAdmin'

export const metadata = {
  manifest: '/api/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="antialiased font-sans">
      <LayoutWrapper>{children}</LayoutWrapper>
    </div>
  )
}
