'use client'

import Link from 'next/link'
import { Instagram, MessageCircle } from 'lucide-react'
import { useAuthContext } from '@/lib/context/AuthContext'

export default function Footer() {
  const { isLoggedIn } = useAuthContext()

  return (
    <footer className="bg-gray-900 text-gray-300 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-3 border-b border-gray-800 pb-8">
          {/* Branding */}
          <div>
            <h4 className="text-xl font-bold tracking-widest text-white mb-2">
              UMADEUS
            </h4>
            <p className="text-gray-400 text-sm mb-3">
              União da Mocidade da Assembleia de Deus na Bahia.
            </p>
            <span className="text-xs text-gray-500">
              Unindo gerações, transformando vidas.
            </span>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="font-semibold text-white mb-2">Links Úteis</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacidade"
                  className="hover:underline hover:text-white transition"
                >
                  Política de Privacidade
                </Link>
              </li>
              {isLoggedIn && (
                <li>
                  <Link
                    href="/admin/dashboard"
                    className="hover:underline hover:text-white transition"
                  >
                    Painel
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-white mb-2">Redes Sociais</h4>
            <ul className="flex gap-4 items-center mt-1">
              <li>
                <Link
                  href="https://instagram.com/umadeusoficial"
                  className="flex items-center gap-2 hover:text-[#E4405F] transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={20} strokeWidth={1.8} />
                  <span className="hidden sm:inline">@umadeusoficial</span>
                </Link>
              </li>
              <li>
                <Link
                  href="https://wa.me/55XXXXXXXXXXX"
                  className="flex items-center gap-2 hover:text-[#25D366] transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={20} strokeWidth={1.8} />
                  <span className="hidden sm:inline">Fale no WhatsApp</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-xs text-white flex flex-col gap-1">
          <p>
            &copy; {new Date().getFullYear()} UMADEUS. Todos os direitos
            reservados.
          </p>
          <p>
            Desenvolvido por{' '}
            <Link
              href="https://m24saude.com.br"
              className="underline hover:text-white transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              M24 Tecnologia
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
