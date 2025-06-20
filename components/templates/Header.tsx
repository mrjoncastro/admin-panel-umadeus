'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { Menu, X, ChevronDown, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CartButton from '@/app/components/CartButton'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useTenant } from '@/lib/context/TenantContext'

type UserRole = 'visitante' | 'usuario' | 'lider' | 'coordenador'

const baseLinks = [
  { href: '/', label: 'Início' },
  { href: '/loja/produtos', label: 'Produtos' },
  { href: '/blog', label: 'Blog' },
  { href: '/loja/eventos', label: 'Eventos' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [clientOpen, setClientOpen] = useState(false)
  const { user, isLoggedIn, logout } = useAuthContext()
  const { config } = useTenant()
  const adminMenuRef = useRef<HTMLUListElement>(null)
  const clientMenuRef = useRef<HTMLUListElement>(null)

  const role: UserRole = useMemo(() => {
    if (!isLoggedIn) return 'visitante'
    if (user?.role === 'coordenador') return 'coordenador'
    if (user?.role === 'lider') return 'lider'
    return 'usuario'
  }, [isLoggedIn, user?.role])

  const adminLinks = useMemo(() => {
    if (role === 'lider') {
      return [
        { href: '/admin/lider-painel', label: 'Painel' },
        { href: '/admin/inscricoes', label: 'Inscrições' },
        { href: '/admin/pedidos', label: 'Pedidos' },
        { href: '/admin/perfil', label: 'Configurações' },
      ]
    }
    if (role === 'coordenador') {
      return [
        { href: '/admin/dashboard', label: 'Painel' },
        { href: '/admin/inscricoes', label: 'Inscrições' },
        { href: '/admin/pedidos', label: 'Pedidos' },
        { href: '/admin/usuarios', label: 'Usuários' },
        { href: '/admin/campos', label: 'Campos' },
        { href: '/admin/produtos', label: 'Produtos' },
        { href: '/admin/eventos', label: 'Eventos' },
        { href: '/admin/posts', label: 'Posts' },
        { href: '/admin/perfil', label: 'Configurações' },
      ]
    }
    return []
  }, [role])

  const navLinks = baseLinks
  const firstName = useMemo(() => user?.nome?.split(' ')[0] ?? '', [user?.nome])

  // FECHAR AO CLICAR FORA
  useEffect(() => {
    if (!adminOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target as Node)
      ) {
        setAdminOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [adminOpen])

  useEffect(() => {
    if (!clientOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (
        clientMenuRef.current &&
        !clientMenuRef.current.contains(event.target as Node)
      ) {
        setClientOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [clientOpen])

  // Função de logout (contexto)
  function handleLogout() {
    logout?.() // pode ser logout(), useAuthLogout(), etc.
    setAdminOpen(false)
    setClientOpen(false)
    setOpen(false)
    window.location.href = '/' // Redireciona para home
  }

  return (
    <>
      <header className="bg-animated backdrop-blur-md text-[var(--text-header-primary)] shadow-md sticky top-0 z-50 gradient-x px-6 py-4 border-b border-platinum/20 fixed top-0 inset-x-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl md:text-2xl font-bold tracking-wide font-bebas"
            aria-label="Página inicial"
          >
            <Image
              src={config.logoUrl || '/img/logo_umadeus_branco.png'}
              alt="UMADEUS"
              width={36}
              height={36}
              className="h-9 w-auto"
            />
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex gap-6 text-base font-medium items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-primary-400 transition px-2 py-1 rounded-md"
              >
                {link.label}
              </Link>
            ))}

            <CartButton />

            {(role === 'lider' || role === 'coordenador') && (
              <div className="relative">
                <button
                  onClick={() => setAdminOpen((prev) => !prev)}
                  className="flex items-center gap-1 hover:text-primary-400 transition px-2 py-1 rounded-md"
                >
                  {isLoggedIn && (
                    <span className="ml-4 text-sm">Olá, {firstName}</span>
                  )}
                  <ChevronDown size={14} />
                </button>
                {adminOpen && (
                  <ul
                    className="absolute right-0 mt-2 w-48 bg-white text-[var(--foreground)] dark:bg-zinc-900 dark:text-white rounded-md shadow z-50 text-sm py-2 space-y-1"
                    ref={adminMenuRef} // referencia para clique fora
                  >
                    {adminLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={() => {
                          logout?.()
                          setAdminOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <span className="inline-flex items-center gap-2">
                          <LogOut size={16} /> Sair
                        </span>
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}

            {role === 'usuario' && (
              <div className="relative">
                <button
                  onClick={() => setClientOpen((prev) => !prev)}
                  className="flex items-center gap-1 hover:text-primary-400 transition px-2 py-1 rounded-md"
                >
                  <span className="ml-4 text-sm">Olá, {firstName}</span>
                  <ChevronDown size={14} />
                </button>
                {clientOpen && (
                  <ul
                    className="absolute right-0 mt-2 w-48 bg-white text-[var(--foreground)] dark:bg-zinc-900 dark:text-white rounded-md shadow z-50 text-sm py-2 space-y-1"
                    ref={clientMenuRef}
                  >
                    <li>
                      <Link
                        href="/loja/cliente"
                        className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        onClick={() => setClientOpen(false)}
                      >
                        Área do Cliente
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer"
                      >
                        <LogOut size={16} /> Sair
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}

            {!isLoggedIn && (
              <>
                <Link href="/login" className="btn btn-primary">
                  Acessar sua conta
                </Link>
                <Link href="/login?view=signup" className="btn btn-secondary">
                  Crie sua conta
                </Link>
              </>
            )}
          </nav>

          {/* Botão Menu Mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-platinum transition"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Navegação Mobile */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden mt-2 px-6 pb-3 flex flex-col gap-2 bg-black_bean/95 backdrop-blur-md border-t border-platinum/10 rounded-b-2xl shadow-lg"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-platinum hover:text-primary-400 transition py-2 text-base font-medium"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <CartButton />

              {(role === 'lider' || role === 'coordenador') && (
                <>
                  <span className="mt-2 font-semibold text-platinum">
                    Admin
                  </span>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-platinum hover:text-primary-400 transition py-2 text-base font-medium"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-600 mt-2"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </>
              )}

              {role === 'usuario' && (
                <>
                  <Link
                    href="/loja/cliente"
                    className="text-platinum hover:text-primary-400 transition py-2 text-base font-medium"
                    onClick={() => setOpen(false)}
                  >
                    Área do Cliente
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-600 mt-2"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </>
              )}

              {!isLoggedIn && (
                <>
                  <Link
                    href="/login"
                    className="btn btn-primary text-sm text-center mt-2"
                    onClick={() => setOpen(false)}
                  >
                    Acessar sua conta
                  </Link>
                  <Link
                    href="/login?view=signup"
                    className="btn btn-secondary text-sm text-center"
                    onClick={() => setOpen(false)}
                  >
                    Crie sua conta
                  </Link>
                </>
              )}

              {isLoggedIn && (
                <span className="mt-2 text-sm text-platinum">
                  Olá, {firstName}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
