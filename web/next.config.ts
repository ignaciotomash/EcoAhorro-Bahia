import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jumboargentina.vteximg.com.br',
      },
      {
        protocol: 'https',
        hostname: 'masonlineprod.vteximg.com.br',
      },
      {
        protocol: 'https',
        hostname: 'cdn.batitienda.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'www.lacoopeencasa.coop',
      },
      {
        protocol: 'https',
        hostname: 'www.labanderita.ar',
      },
      {
        protocol: 'https',
        hostname: 'www.masonline.com.ar',
      },
      {
        protocol: 'https',
        hostname: 'www.vea.com.ar',
      },
    ],
  },
};

export default nextConfig;
