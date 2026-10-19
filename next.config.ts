import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "covers.openlibrary.org" },
      {
        protocol: "https",
        hostname: "8f5j2fgytqnncvdh.public.blob.vercel-storage.com",
      },
    ],
  },
  httpAgentOptions: {
    keepAlive: true,
  },
};

export default nextConfig;
