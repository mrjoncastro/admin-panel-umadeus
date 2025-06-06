"use client";

import { usePathname } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import BackToTopButton from "@/app/components/BackToTopButton";
import NotificationBell from "@/app/components/NotificationBell";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isInscricaoPublica = /^\/inscricoes\/[^/]+$/.test(pathname);
  const { isLoggedIn, user } = useAuthContext();

  return (
    <>
      {!isInscricaoPublica && <Header />}
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      {isLoggedIn && user?.role === "coordenador" && <NotificationBell />}
      <BackToTopButton />
    </>
  );
}
