"use client";

import Link from "next/link";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function Footer() {
  const { isLoggedIn } = useAuthContext();

  return (
    <footer className="bg-eerie_black text-platinum py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <h4 className="text-lg font-bold mb-2">UMADEUS</h4>
          <p>União da Mocidade da Assembleia de Deus na Bahia.</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Links Úteis</h4>
          <ul className="space-y-1">
            <li>
              <Link href="/faq" className="hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contato" className="hover:underline">
                Contato
              </Link>
            </li>
            <li>
              <Link href="/privacidade" className="hover:underline">
                Política de Privacidade
              </Link>
            </li>
            {isLoggedIn && (
              <li>
                <Link href="/dashboard" className="hover:underline">
                  Painel
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Redes Sociais</h4>
          <ul className="space-y-1">
            <li>
              <a
                href="https://instagram.com/umadeusoficial"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                @umadeusoficial
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/55XXXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Fale conosco no WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-platinum mt-6">
        &copy; {new Date().getFullYear()} UMADEUS. Todos os direitos reservados.
      </div>
    </footer>
  );
}
