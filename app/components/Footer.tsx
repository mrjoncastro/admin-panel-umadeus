"use client";

import Link from "next/link";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function Footer() {
  const { isLoggedIn } = useAuthContext();

  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
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
                <Link href="/admin/dashboard" className="hover:underline">
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
              <Link
                href="https://instagram.com/umadeusoficial"
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @umadeusoficial
              </Link>
            </li>
            <li>
              <Link
                href="https://wa.me/55XXXXXXXXXXX"
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fale conosco no WhatsApp
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-6 space-y-1">
        <p>
          &copy; {new Date().getFullYear()} UMADEUS. Todos os direitos
          reservados.
        </p>
        <p>
          Desenvolvido por{" "}
          <Link
            href="https://qg3.com.br"
            className="underline hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            QG3 Tecnologia
          </Link>
        </p>
      </div>
    </footer>
  );
}
