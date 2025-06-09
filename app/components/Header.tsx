"use client";

import { useMemo, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // se quiser exibir logo
import { useAuthContext } from "@/lib/context/AuthContext";
import { useAppConfig } from "@/lib/context/AppConfigContext";

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
  const [adminOpen, setAdminOpen] = useState(false);
  const { user, isLoggedIn } = useAuthContext();
  const { config } = useAppConfig();

  const role: UserRole = useMemo(() => {
    if (!isLoggedIn) return "visitante";
    if (user?.role === "coordenador") return "coordenador";
    if (user?.role === "lider") return "lider";
    return "usuario";
  }, [isLoggedIn, user?.role]);

  const adminLinks = useMemo(() => {
    if (role === "lider") {
      return [
        { href: "/admin/lider-painel", label: "Painel" },
        { href: "/admin/inscricoes", label: "Inscrições" },
        { href: "/admin/pedidos", label: "Pedidos" },
        { href: "/admin/perfil", label: "Configurações" },
      ];
    }
    if (role === "coordenador") {
      return [
        { href: "/admin/dashboard", label: "Painel" },
        { href: "/admin/inscricoes", label: "Inscrições" },
        { href: "/admin/pedidos", label: "Pedidos" },
        { href: "/admin/usuarios", label: "Usuários" },
        { href: "/admin/campos", label: "Campos" },
        { href: "/admin/posts", label: "Posts" },
        { href: "/admin/perfil", label: "Configurações" },
      ];
    }
    return [];
  }, [role]);

  const navLinks = baseLinks;

  const firstName = useMemo(
    () => user?.nome?.split(" ")[0] ?? "",
    [user?.nome]
  );

  return (
    <header className="bg-animated backdrop-blur-md text-[var(--text-header-primary)] shadow-md sticky top-0 z-50 gradient-x px-6 py-4 border-b border-platinum/20 fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl md:text-2xl font-bold tracking-wide font-bebas"
          aria-label="Página inicial"
        >
          <Image
            src={config.logoUrl || "/img/logo_umadeus_branco.png"}
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
              className="hover:text-[var(--primary-400)] transition px-2 py-1 rounded-md"
            >
              {link.label}
            </Link>
          ))}

          {!isLoggedIn && (
            <Link
              href="/admin/login"
              className="btn btn-primary text-sm whitespace-nowrap"
            >
              Acessar sua conta
            </Link>
          )}

          {(role === "lider" || role === "coordenador") && (
            <div className="relative">
              <button
                onClick={() => setAdminOpen((prev) => !prev)}
                className="flex items-center gap-1 hover:text-[var(--primary-400)] transition px-2 py-1 rounded-md"
              >
                {isLoggedIn && (
                  <span className="ml-4 text-sm">Olá, {firstName}</span>
                )}
                <ChevronDown size={14} />
              </button>
              {adminOpen && (
                <ul className="absolute right-0 mt-2 w-48 bg-white text-[var(--foreground)] dark:bg-zinc-900 dark:text-white rounded-md shadow z-50 text-sm py-2 space-y-1">
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
                </ul>
              )}
            </div>
          )}
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
              className="text-platinum hover:text-[var(--primary-400)] transition py-2 text-base font-medium"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {(role === "lider" || role === "coordenador") && (
            <>
              <span className="mt-2 font-semibold text-platinum">Admin</span>
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-platinum hover:text-[var(--primary-400)] transition py-2 text-base font-medium"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </>
          )}

          {!isLoggedIn && (
            <Link
              href="/admin/login"
              onClick={() => setOpen(false)}
              className="btn btn-primary text-sm text-center mt-2"
            >
              Acessar sua conta
            </Link>
          )}

          {isLoggedIn && (
            <span className="mt-2 text-sm text-platinum">Olá, {firstName}</span>
          )}
        </div>
      )}
    </header>
  );
}
