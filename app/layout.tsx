// app/layout.tsx
import './globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'
import { ThemeProvider } from '@/lib/context/ThemeContext'
import { ToastProvider } from '@/lib/context/ToastContext'
import { TenantProvider } from '@/lib/context/TenantContext'
import { generatePrimaryShades } from '@/utils/primaryShades'
import { fetchTenantConfig } from '@/lib/fetchTenantConfig'
import { CartProvider } from '@/lib/context/CartContext'

export const metadata = {
  title: 'UMADEUS',
  description: 'Sistema de inscrições e gestão UMADEUS',
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
  const preload = `window.__TENANT_CONFIG__=${JSON.stringify(cfg)};(function(){const s=document.documentElement.style;s.setProperty('--font-body','${cfg.font}');s.setProperty('--font-heading','${cfg.font}');s.setProperty('--logo-url','${cfg.logoUrl}');s.setProperty('--accent','${cfg.primaryColor}');s.setProperty('--accent-900','${shades['900']}');${Object.entries(
    shades,
  )
    .map(([k, v]) => `s.setProperty('--primary-${k}','${v}');`)
    .join('')}})();`
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: preload }} />
      </head>
      <body className="font-sans antialiased">
        <TenantProvider initialConfig={cfg}>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <ToastProvider>{children}</ToastProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </TenantProvider>
      </body>
    </html>
  )
}
