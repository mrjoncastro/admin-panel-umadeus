"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import pb from "@/lib/pocketbase";
import Image from "next/image";

const navLinks = [
  { href: "/dashboard", label: "Painel" },
  { href: "/inscricoes", label: "Inscrições" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/usuarios", label: "Usuários" },
  { href: "/campos", label: "Campos" },
];

export default function Header() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuthContext();

  const handleLogout = () => {
    pb.authStore.clear();
    localStorage.removeItem("pb_token");
    localStorage.removeItem("pb_user");
    window.location.href = "/"; // 🔁 redireciona e recarrega
  };

  return (
    <header className="bg-[#2A1A1C] text-[#DCDCDC] shadow-md sticky top-0 z-50">
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

        <nav className="flex gap-4 text-sm font-semibold items-center">
          {isLoggedIn &&
            navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`transition px-3 py-1 rounded-full hover:bg-[#DCDCDC] hover:text-[#2A1A1C] cursor-pointer ${
                  pathname === href ? "bg-[#DCDCDC] text-[#2A1A1C]" : ""
                }`}
              >
                {label}
              </Link>
            ))}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="ml-2 text-sm underline text-red-400 hover:text-red-600 cursor-pointer"
            >
              Sair
            </button>
          ) : (
            <Link
              href="/"
              className="text-sm underline text-[#DCDCDC] hover:text-white cursor-pointer"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
