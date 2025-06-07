import "../globals.css";
import LayoutWrapper from "../components/LayoutWrapper";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "UMADEUS Blog",
  description: "Artigos e notícias da UMADEUS",
};

export default function BlogLayout({
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
