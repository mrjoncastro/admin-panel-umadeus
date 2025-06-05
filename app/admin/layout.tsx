// app/layout.tsx
import "../globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata = {
  title: "UMADEUS",
  description: "Sistema de inscrições e gestão UMADEUS",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/apple-icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "16x16", type: "image/png" },
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
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <LayoutWrapper>{children}</LayoutWrapper>
    </div>
  );
}
