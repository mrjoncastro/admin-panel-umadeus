import "../globals.css";
import LayoutWrapper from "../components/LayoutWrapper";

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
    <div className="text-platinum font-sans">
      <LayoutWrapper>{children}</LayoutWrapper>
    </div>
  );
}
