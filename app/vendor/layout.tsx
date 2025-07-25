'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Store, 
  Package, 
  DollarSign, 
  BarChart3, 
  Settings,
  ShoppingCart,
  User,
  Bell,
  Star
} from 'lucide-react'

const vendorRoutes = [
  {
    label: 'Dashboard',
    icon: BarChart3,
    href: '/vendor',
  },
  {
    label: 'Meus Produtos',
    icon: Package,
    href: '/vendor/produtos',
  },
  {
    label: 'Pedidos',
    icon: ShoppingCart,
    href: '/vendor/pedidos',
  },
  {
    label: 'Comissões',
    icon: DollarSign,
    href: '/vendor/comissoes',
  },
  {
    label: 'Avaliações',
    icon: Star,
    href: '/vendor/avaliacoes',
  },
  {
    label: 'Notificações',
    icon: Bell,
    href: '/vendor/notificacoes',
  },
  {
    label: 'Perfil',
    icon: User,
    href: '/vendor/perfil',
  },
  {
    label: 'Configurações',
    icon: Settings,
    href: '/vendor/configuracoes',
  },
]

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel do Vendedor</h1>
                <p className="text-sm text-gray-500">Gerencie seus produtos e vendas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Bell className="h-5 w-5 text-gray-400" />
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {vendorRoutes.map((route) => {
              const Icon = route.icon
              const isActive = pathname === route.href
              
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                  {route.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}