'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Store, 
  Users, 
  Package, 
  DollarSign, 
  BarChart3, 
  Settings,
  ShoppingCart,
  Star
} from 'lucide-react'

const marketplaceRoutes = [
  {
    label: 'Dashboard',
    icon: BarChart3,
    href: '/admin/marketplace',
  },
  {
    label: 'Vendedores',
    icon: Users,
    href: '/admin/marketplace/vendedores',
  },
  {
    label: 'Produtos',
    icon: Package,
    href: '/admin/marketplace/produtos',
  },
  {
    label: 'Pedidos',
    icon: ShoppingCart,
    href: '/admin/marketplace/pedidos',
  },
  {
    label: 'Comissões',
    icon: DollarSign,
    href: '/admin/marketplace/comissoes',
  },
  {
    label: 'Avaliações',
    icon: Star,
    href: '/admin/marketplace/avaliacoes',
  },
  {
    label: 'Configurações',
    icon: Settings,
    href: '/admin/marketplace/configuracoes',
  },
]

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-6">
          <Store className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Marketplace</h2>
        </div>
        
        <nav className="space-y-2">
          {marketplaceRoutes.map((route) => {
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
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 bg-gray-50">
        {children}
      </div>
    </div>
  )
}