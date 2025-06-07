import Link from "next/link";
import Hero from "@/app/components/Hero";
import Header from "./components/Header";

export default function PortalPage() {
  return (
    <>
    <Header />
    <Hero />
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-900 text-gray-100">
        <h1 className="text-3xl font-bold">Portal UMADEUS</h1>
        <div className="flex gap-4">
          <Link
            href="/loja"
            className="px-4 py-2 rounded bg-red-700 hover:bg-red-600"
          >
            Loja
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
          >
            Admin
          </Link>
        </div>
      </div>
    </main>
    </>
  );
}
