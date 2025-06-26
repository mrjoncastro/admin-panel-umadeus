// app/layout.tsx
import './globals.css'
import type { CSSProperties } from 'react'
import { AuthProvider } from '@/lib/context/AuthContext'
import { ThemeProvider } from '@/lib/context/ThemeContext'
import { ToastProvider } from '@/lib/context/ToastContext'
import { TenantProvider } from '@/lib/context/TenantContext'
import { generatePrimaryShades } from '@/utils/primaryShades'
import { fetchTenantConfig } from '@/lib/fetchTenantConfig'
import { CartProvider } from '@/lib/context/CartContext'
import dynamic from 'next/dynamic'

const AdminClientTour = dynamic(() => import('@/components/AdminClientTourLoader'))

export const metadata = {
  metadataBase: new URL('https://umadeus.com.br'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon0.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon1.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cfg = await fetchTenantConfig()
  const shades = generatePrimaryShades(cfg.primaryColor)

  const htmlStyle = {
    '--font-body': cfg.font,
    '--font-heading': cfg.font,
    '--logo-url': cfg.logoUrl,
    '--accent': cfg.primaryColor,
    '--accent-900': shades['900'],
    ...Object.fromEntries(
      Object.entries(shades).map(([k, v]) => [`--primary-${k}`, v]),
    ),
  } as CSSProperties

  const preload = `window.__TENANT_CONFIG__=${JSON.stringify(cfg)};`

  return (
    <html lang="pt-BR" style={htmlStyle}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preload }} />
      </head>
      <body className="font-sans antialiased">
        <TenantProvider initialConfig={cfg}>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <ToastProvider>
                  <AdminClientTour />
                  {children}
                </ToastProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </TenantProvider>
      </body>
    </html>
  )
}
