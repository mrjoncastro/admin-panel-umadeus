// app/layout.tsx
import '@/app/globals.css'
import LayoutWrapper from '@/components/templates/LayoutWrapperAdmin'
import dynamic from 'next/dynamic'

const AdminClientTour = dynamic(() => import('@/components/AdminClientTourLoader'))

export const metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/apple-icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="antialiased font-sans">
      <LayoutWrapper>
        <AdminClientTour />
        {children}
      </LayoutWrapper>
    </div>
  )
}
