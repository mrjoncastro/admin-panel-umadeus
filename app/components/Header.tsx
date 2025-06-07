"use client";

import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // se quiser exibir logo
import { useAuthContext } from "@/lib/context/AuthContext";

type UserRole = "visitante" | "usuario" | "lider" | "coordenador";

const baseLinks = [
  { href: "/", label: "Início" },
  { href: "/loja", label: "Loja" },
  { href: "/blog", label: "Blog" },
  { href: "/loja/eventos", label: "Eventos" },
  { href: "/loja/faq", label: "FAQ" },
  { href: "/loja/contato", label: "Contato" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, isLoggedIn } = useAuthContext();

  const role: UserRole = useMemo(() => {
    if (!isLoggedIn) return "visitante";
    if (user?.role === "coordenador") return "coordenador";
    if (user?.role === "lider") return "lider";
    return "usuario";
  }, [isLoggedIn, user?.role]);

  const navLinks = useMemo(() => {
    const links = [...baseLinks];
    if (role === "lider" || role === "coordenador") {
      links.push({ href: "/admin/dashboard", label: "Painel" });
    }
    return links;
  }, [role]);

  return (
    <header className="bg-animated backdrop-blur-md text-[var(--text-header-primary)] shadow-md sticky top-0 z-50 gradient-x px-6 py-4 border-b border-platinum/20 fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl md:text-2xl font-bold tracking-wide font-bebas"
          aria-label="Página inicial"
        >
          {/* Se tiver imagem de logo, descomente a linha abaixo */}
          <Image
            src="/img/logo_umadeus_branco.png"
            alt="UMADEUS"
            width={36}
            height={36}
            className="h-9 w-auto"
          />
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex gap-6 text-base font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-yellow-400 transition px-2 py-1 rounded-md"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Botão Menu Mobile */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-platinum transition"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Navegação Mobile */}
      {open && (
        <div className="md:hidden mt-2 px-6 pb-3 flex flex-col gap-2 bg-black_bean/95 backdrop-blur-md border-t border-platinum/10 rounded-b-2xl shadow-lg animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-platinum hover:text-yellow-400 transition py-2 text-base font-medium"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
