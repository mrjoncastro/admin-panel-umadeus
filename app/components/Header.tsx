"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Início" },
    { href: "/loja", label: "Loja" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <header className="bg-black_bean/80 backdrop-blur-sm text-platinum px-6 py-4 border-b border-platinum/20 fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl md:text-2xl font-bold tracking-wide font-bebas">
          UMADEUS
        </Link>

        <nav className="hidden md:flex gap-6 text-sm md:text-base font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-yellow-400 transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-platinum"
          aria-label="Abrir menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden mt-4 px-6 pb-4 flex flex-col gap-3 bg-black_bean/80 backdrop-blur-sm border-t border-platinum/20">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-platinum hover:text-yellow-400 transition py-1"
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
