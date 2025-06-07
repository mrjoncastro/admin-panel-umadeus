import "../globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "UMADEUS",
  description: "Site oficial da UMADEUS – Produtos e Eventos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`text-platinum font-sans ${inter.className}`}> 
      <Header />
      <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">{children}</main>
      <Footer />
    </div>
  );
}
