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
  turbopack: {},
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Avoid eval-source-map conflict with pdfjs-dist ESM in development
      config.devtool = "cheap-module-source-map";
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdfjs-dist$": "pdfjs-dist/build/pdf.min.mjs",
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
