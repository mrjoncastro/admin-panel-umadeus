"use client";

import Header from "./Header";
import Footer from "./Footer";
import BackToTopButton from "@/app/admin/components/BackToTopButton";
import NotificationBell from "@/app/admin/components/NotificationBell";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, user } = useAuthContext();
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        {children}
      </main>
      <Footer />
      {isLoggedIn && user?.role === "coordenador" && <NotificationBell />}
      <BackToTopButton />
    </>
  );
}
