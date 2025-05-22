import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["mercadopago.com.br"],
  },
  redirects: async () => [
    {
      source: "/inscricao",
      destination: "/inscricao/congresso",
      permanent: true,
    },
  ],
  rewrites: async () => [
    {
      source: "/api/mp/:path*",
      destination: "https://api.mercadopago.com/:path*",
    },
  ],
};

export default nextConfig;
