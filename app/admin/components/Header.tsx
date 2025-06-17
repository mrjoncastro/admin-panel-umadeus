"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useMemo, useState } from "react";
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
  Settings,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/context/ThemeContext";
import { useAppConfig } from "@/lib/context/AppConfigContext";
import RedefinirSenhaModal from "./RedefinirSenhaModal";

const getNavLinks = (role?: string) => {
  if (role === "lider") {
    return [
      { href: "/admin/lider-painel", label: "Painel" },
      { href: "/admin/inscricoes", label: "Inscrições" },
      { href: "/admin/pedidos", label: "Pedidos" },
      { href: "/loja", label: "Ver loja" },
    ];
  }

  return [{ href: "/admin/dashboard", label: "Painel" }];
};

export default function Header() {
  const pathname = usePathname();
  const { isLoggedIn, user } = useAuthContext();
  const pb = useMemo(() => createPocketBase(), []);
  const [menuAberto, setMenuAberto] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [financeiroAberto, setFinanceiroAberto] = useState(false);
  const [gestaoAberto, setGestaoAberto] = useState(false);
  const [gestaoLojaAberto, setGestaoLojaAberto] = useState(false);
  const [gerenciamentoAberto, setGerenciamentoAberto] = useState(false);
  const [mostrarModalSenha, setMostrarModalSenha] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { config } = useAppConfig();

  const navLinks = getNavLinks(user?.role);

  const gestaoEventosLinks = [
    { href: "/admin/eventos", label: "Eventos" },
    { href: "/admin/inscricoes", label: "Inscrições" },
    { href: "/admin/pedidos", label: "Pedidos" },
  ];

  const gestaoLojaLinks = [
    { href: "/admin/produtos", label: "Produtos" },
    { href: "/admin/compras", label: "Compras" },
    { href: "/loja", label: "Ver loja" },
  ];
  const gerenciamentoLinks =
    user?.role === "lider"
      ? [
          { href: "/admin/posts", label: "Posts" },
          { href: "/admin/inscricoes", label: "Inscrições" },
          { href: "/admin/pedidos", label: "Pedidos" },
        ]
      : [
          { href: "/admin/usuarios", label: "Usuários" },
          { href: "/admin/posts", label: "Posts" },
          { href: "/admin/campos", label: "Campos" },
        ];

  const handleLogout = () => {
    pb.authStore.clear();
    localStorage.removeItem("pb_token");
    localStorage.removeItem("pb_user");
    window.location.href = "/login";
  };

  return (
    <header className="bg-animated backdrop-blur-md text-[var(--text-header-primary)] shadow-md sticky top-0 z-50 gradient-x">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center">
          <Image
            src={config.logoUrl || "/img/logo_umadeus_branco.png"}
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
            navLinks.map(({ href, label }) => {
              const active =
                href === "/admin/produtos"
                  ? pathname.startsWith("/admin/produtos")
                  : pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`transition px-3 py-1 rounded-full hover:bg-[var(--background)] hover:text-[var(--foreground)] cursor-pointer ${
                    active
                      ? "bg-[var(--background)] text-[var(--foreground)]"
                      : ""
                  }`}
                >
                  {label}
                </Link>
              );
            })}

          {/* Gestão de Eventos */}
          {isLoggedIn && user?.role === "coordenador" && (
            <Popover.Root open={gestaoAberto} onOpenChange={setGestaoAberto}>
              <Popover.Trigger asChild>
                <button className="flex items-center gap-1 hover:opacity-90">
                  <span>Gestão de Eventos</span>
                  <ChevronDown size={14} />
                </button>
              </Popover.Trigger>
              <AnimatePresence>
                {gestaoAberto && (
                  <Popover.Portal forceMount>
                    <Popover.Content asChild side="bottom" align="start">
                      <motion.ul
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mt-2 w-48 bg-white text-[var(--foreground)] dark:bg-zinc-900 dark:text-white rounded-lg shadow z-50 text-sm py-2 space-y-2"
                      >
                        {gestaoEventosLinks.map(({ href, label }) => (
                          <li key={href}>
                            <Link
                              href={href}
                              onClick={() => setGestaoAberto(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                              {label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    </Popover.Content>
                  </Popover.Portal>
                )}
              </AnimatePresence>
            </Popover.Root>
          )}

          {/* Gestão da Loja */}
          {isLoggedIn && user?.role === "coordenador" && (
            <Popover.Root
              open={gestaoLojaAberto}
              onOpenChange={setGestaoLojaAberto}
            >
              <Popover.Trigger asChild>
                <button className="flex items-center gap-1 hover:opacity-90">
                  <span>Gestão da Loja</span>
                  <ChevronDown size={14} />
                </button>
              </Popover.Trigger>
              <AnimatePresence>
                {gestaoLojaAberto && (
                  <Popover.Portal forceMount>
                    <Popover.Content asChild side="bottom" align="start">
                      <motion.ul
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mt-2 w-48 bg-white text-[var(--foreground)] dark:bg-zinc-900 dark:text-white rounded-lg shadow z-50 text-sm py-2 space-y-2"
                      >
                        {gestaoLojaLinks.map(({ href, label }) => (
                          <li key={href}>
                            <Link
                              href={href}
                              onClick={() => setGestaoLojaAberto(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                              {label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    </Popover.Content>
                  </Popover.Portal>
                )}
              </AnimatePresence>
            </Popover.Root>
          )}

          {/* Administração */}
          {isLoggedIn && (
            <Popover.Root
              open={gerenciamentoAberto}
              onOpenChange={setGerenciamentoAberto}
            >
              <Popover.Trigger asChild>
                <button className="flex items-center gap-1 hover:opacity-90">
                  <span>Administração</span>
                  <ChevronDown size={14} />
                </button>
              </Popover.Trigger>
              <AnimatePresence>
                {gerenciamentoAberto && (
                  <Popover.Portal forceMount>
                    <Popover.Content asChild side="bottom" align="start">
                      <motion.ul
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mt-2 w-48 bg-white text-[var(--foreground)] dark:bg-zinc-900 dark:text-white rounded-lg shadow z-50 text-sm py-2 space-y-2"
                      >
                        {gerenciamentoLinks.map(({ href, label }) => (
                          <li key={href}>
                            <Link
                              href={href}
                              onClick={() => setGerenciamentoAberto(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                              {label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    </Popover.Content>
                  </Popover.Portal>
                )}
              </AnimatePresence>
            </Popover.Root>
          )}

          {/* Financeiro */}
          {isLoggedIn && user?.role === "coordenador" && (
            <Popover.Root
              open={financeiroAberto}
              onOpenChange={setFinanceiroAberto}
            >
              <Popover.Trigger asChild>
                <button className="flex items-center gap-1 hover:opacity-90">
                  <span>Financeiro</span>
                  <ChevronDown size={14} />
                </button>
              </Popover.Trigger>
              <AnimatePresence>
                {financeiroAberto && (
                  <Popover.Portal forceMount>
                    <Popover.Content asChild side="bottom" align="start">
                      <motion.ul
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mt-2 w-48 bg-white text-[var(--foreground)] dark:bg-zinc-900 dark:text-white rounded-lg shadow z-50 text-sm py-2 space-y-2"
                      >
                        <li>
                          <Link
                            href="/admin/financeiro/saldo"
                            onClick={() => setFinanceiroAberto(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            Saldo
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/admin/financeiro/transferencias"
                            onClick={() => setFinanceiroAberto(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            Transferência
                          </Link>
                        </li>
                      </motion.ul>
                    </Popover.Content>
                  </Popover.Portal>
                )}
              </AnimatePresence>
            </Popover.Root>
          )}

          {/* Tema */}
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="p-2 rounded hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Perfil */}
          {isLoggedIn && (
            <Popover.Root open={perfilAberto} onOpenChange={setPerfilAberto}>
              <Popover.Trigger asChild>
                <button className="flex items-center gap-2 text-sm font-semibold hover:opacity-90">
                  <User size={18} />
                  <span className="cursor-pointer">
                    Olá, {user?.nome?.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} />
                </button>
              </Popover.Trigger>
              <AnimatePresence>
                {perfilAberto && (
                  <Popover.Portal forceMount>
                    <Popover.Content asChild side="bottom" align="end">
                      <motion.ul
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mt-2 w-52 bg-white text-[var(--foreground)] dark:bg-zinc-900 dark:text-white rounded-lg shadow z-50 text-sm py-2 space-y-2"
                      >
                        <li>
                          <Link
                            href="/admin/perfil"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <User size={16} /> Visualizar perfil
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/admin/configuracoes"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Settings size={16} />
                            Configurações
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
                      </motion.ul>
                    </Popover.Content>
                  </Popover.Portal>
                )}
              </AnimatePresence>
            </Popover.Root>
          )}

          {!isLoggedIn && (
            <Link
              href="/login"
              className="text-sm underline text-[var(--text-header-primary)] hover:text-white cursor-pointer"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>

      {/* Menu Mobile */}
      {menuAberto && (
        <div className="md:hidden bg-[var(--background)] text-[var(--foreground)] px-6 pb-4">
          <nav className="flex flex-col gap-2">
            {isLoggedIn && (
              <>
                {navLinks.map(({ href, label }) => {
                  const active =
                    href === "/admin/produtos"
                      ? pathname.startsWith("/admin/produtos")
                      : pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuAberto(false)}
                      className={`transition px-4 py-2 rounded-md text-sm hover:bg-[var(--background)] hover:text-[var(--foreground)] ${
                        active
                          ? "bg-[var(--background)] text-[var(--foreground)]"
                          : ""
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}

                {user?.role === "coordenador" && (
                  <>
                    <span className="mt-2 text-xs uppercase font-semibold opacity-70">
                      Gestão de Eventos
                    </span>
                    {gestaoEventosLinks.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMenuAberto(false)}
                        className="px-4 py-2 text-sm hover:bg-[var(--background)] hover:text-[var(--foreground)] rounded-md"
                      >
                        {label}
                      </Link>
                    ))}

                    <span className="mt-2 text-xs uppercase font-semibold opacity-70">
                      Gestão da Loja
                    </span>
                    {gestaoLojaLinks.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMenuAberto(false)}
                        className="px-4 py-2 text-sm hover:bg-[var(--background)] hover:text-[var(--foreground)] rounded-md"
                      >
                        {label}
                      </Link>
                    ))}
                  </>
                )}

                <span className="mt-2 text-xs uppercase font-semibold opacity-70">
                  Administração
                </span>
                {gerenciamentoLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuAberto(false)}
                    className="px-4 py-2 text-sm hover:bg-[var(--background)] hover:text-[var(--foreground)] rounded-md"
                  >
                    {label}
                  </Link>
                ))}
              </>
            )}

            {isLoggedIn && user?.role === "coordenador" && (
              <>
                <Link
                  href="/admin/financeiro/saldo"
                  onClick={() => setMenuAberto(false)}
                  className="px-4 py-2 text-sm hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                >
                  Saldo
                </Link>
                <Link
                  href="/admin/financeiro/transferencias"
                  onClick={() => setMenuAberto(false)}
                  className="px-4 py-2 text-sm hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                >
                  Transferência
                </Link>
              </>
            )}

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
                <Link
                  href="/admin/configuracoes"
                  onClick={() => setMenuAberto(false)}
                  className="px-4 py-2 text-sm hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                >
                  Configurações
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
                href="/login"
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
