import Link from "next/link";
import Hero from "@/app/components/Hero";
import Header from "./components/Header";

export default function PortalPage() {
  return (
    <>
    <Header />
    <Hero />
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

    </main>
    </>
  );
}
