import "../globals.css";
import LayoutWrapper from "../components/LayoutWrapper";
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
      <LayoutWrapper>{children}</LayoutWrapper>
    </div>
  );
}
