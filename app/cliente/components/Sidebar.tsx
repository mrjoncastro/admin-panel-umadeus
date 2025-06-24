'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()!
  const links = [
    { href: '/cliente/dashboard', label: 'Dashboard' },
    { href: '/cliente/pedidos', label: 'Pedidos' },
    { href: '/cliente/inscricoes', label: 'Inscrições' },
    { href: '/cliente/perfil', label: 'Perfil' },
  ]
  return (
    <nav className="card w-full md:w-60">
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`block p-2 rounded ${
                pathname === link.href
                  ? 'bg-purple-600 text-white'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
