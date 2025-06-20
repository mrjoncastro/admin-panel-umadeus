// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { TenantProvider } from "@/lib/context/TenantContext";
import { CartProvider } from "@/lib/context/CartContext";

export const metadata = {
  title: "UMADEUS",
  description: "Sistema de inscrições e gestão UMADEUS",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon0.png", sizes: "32x32", type: "image/png" },
      { url: "/icon1.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <TenantProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <ToastProvider>{children}</ToastProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
