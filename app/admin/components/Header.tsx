"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useMemo } from "react";
import createPocketBase from "@/lib/pocketbase";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  User,
  Lock,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/context/ThemeContext";
import RedefinirSenhaModal from "./RedefinirSenhaModal";

const getNavLinks = (role?: string) => {
  if (role === "lider") {
    return [
      { href: "/admin/lider-painel", label: "Painel" },
      { href: "/admin/inscricoes", label: "Inscrições" },
      { href: "/admin/pedidos", label: "Pedidos" },
    ];
  }

  return [
    { href: "/admin/dashboard", label: "Painel" },
    { href: "/admin/inscricoes", label: "Inscrições" },
    { href: "/admin/pedidos", label: "Pedidos" },
    { href: "/admin/usuarios", label: "Usuários" },
    { href: "/admin/campos", label: "Campos" },
  ];
};

export default function Header() {
  const pathname = usePathname();
  const { isLoggedIn, user } = useAuthContext();
  const pb = useMemo(() => createPocketBase(), []);
  const [menuAberto, setMenuAberto] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [mostrarModalSenha, setMostrarModalSenha] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = getNavLinks(user?.role);

  const handleLogout = () => {
    pb.authStore.clear();
    localStorage.removeItem("pb_token");
    localStorage.removeItem("pb_user");
    window.location.href = "/admin/login";
  };

  return (
    <header className="bg-animated backdrop-blur-md text-[var(--text-header-primary)] shadow-md sticky top-0 z-50 gradient-x">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center">
          <Image
            src="/img/logo_umadeus_branco.png"
            alt="Logotipo UMADEUS"
            width={160}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Botão hambúrguer */}
        <button
          className="md:hidden text-[var(--text-header-primary)]"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label="Abrir menu"
        >
          {menuAberto ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navegação - desktop */}
        <nav className="hidden md:flex gap-4 text-sm font-semibold items-center">
          {isLoggedIn &&
            navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`transition px-3 py-1 rounded-full hover:bg-[var(--background)] hover:text-[var(--foreground)] cursor-pointer ${
                  pathname === href ? "bg-[var(--background)] text-[var(--foreground)]" : ""
                }`}
              >
                {label}
              </Link>
            ))}

          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="p-2 rounded hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setPerfilAberto((prev) => !prev)}
                className="flex items-center gap-2 text-sm font-semibold hover:opacity-90"
              >
                <User size={18} />
                <span className="cursor-pointer">
                  Olá, {user?.nome?.split(" ")[0]}
                </span>
                <ChevronDown size={14} />
              </button>

              {perfilAberto && (
                <ul className="absolute right-0 mt-2 w-52 bg-white text-[var(--foreground)] dark:bg-zinc-900 dark:text-white rounded-lg shadow z-50 text-sm py-2 space-y-2">
                  <li>
                    <Link
                      href="/admin/perfil"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <User size={16} /> Visualizar perfil
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setMostrarModalSenha(true);
                        setPerfilAberto(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Lock size={16} /> Redefinir senha
                    </button>
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
            <Link
              href="/admin/login"
              className="text-sm underline text-[var(--text-header-primary)] hover:text-white cursor-pointer"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>

      {/* Menu Mobile */}
      {menuAberto && (
        <div className="md:hidden bg-[var(--text-header-primary)] px-6 pb-4">
          <nav className="flex flex-col gap-2">
            {isLoggedIn &&
              navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuAberto(false)}
                  className={`transition px-4 py-2 rounded-md text-sm hover:bg-[var(--background)] hover:text-[var(--foreground)] ${
                    pathname === href ? "bg-[var(--background)] text-[var(--foreground)]" : ""
                  }`}
                >
                  {label}
                </Link>
              ))}

            <button
              onClick={() => {
                toggleTheme();
              }}
              className="text-left px-4 py-2 text-sm hover:bg-[var(--background)] hover:text-[var(--foreground)]"
            >
              {theme === "dark" ? "Tema claro" : "Tema escuro"}
            </button>

            {isLoggedIn && (
              <>
                <Link
                  href="/admin/perfil"
                  onClick={() => setMenuAberto(false)}
                  className="px-4 py-2 text-sm hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                >
                  Perfil
                </Link>
                <button
                  onClick={() => {
                    setMenuAberto(false);
                    setMostrarModalSenha(true);
                  }}
                  className="text-left px-4 py-2 text-sm hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                >
                  Redefinir senha
                </button>

                <button
                  onClick={() => {
                    setMenuAberto(false);
                    handleLogout();
                  }}
                  className="text-left px-4 py-2 text-sm underline text-red-400 hover:text-red-600"
                >
                  Sair
                </button>
              </>
            )}

            {!isLoggedIn && (
              <Link
                href="/admin/login"
                onClick={() => setMenuAberto(false)}
                className="text-left px-4 py-2 text-sm underline text-[var(--text-header-primary)] hover:text-white"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      )}

      {mostrarModalSenha && (
        <RedefinirSenhaModal onClose={() => setMostrarModalSenha(false)} />
      )}
    </header>
  );
}
