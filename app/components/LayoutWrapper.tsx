"use client";

import { usePathname } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isInscricaoPublica = /^\/inscricoes\/[^/]+$/.test(pathname);

  return (
    <>
      {!isInscricaoPublica && <Header />}
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
