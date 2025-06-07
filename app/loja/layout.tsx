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
    <div className={`bg-gradient-to-r from-black_bean via-[#5f1b1f] to-eerie_black animate-gradient-x text-platinum font-sans ${inter.className}`}> 
      <Header />
      <main className="flex flex-col min-h-screen pt-20">{children}</main>
      <Footer />
    </div>
  );
}
