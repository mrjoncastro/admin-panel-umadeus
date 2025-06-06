import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["asaas.com"],
  },
  redirects: async () => [
    {
      source: "/inscricao",
      destination: "/loja/inscricoes",
      permanent: true,
    },
  ],
  rewrites: async () => [],
};

export default nextConfig;
