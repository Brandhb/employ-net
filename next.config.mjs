import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    googleAnalyticsId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
  },
  webpack: (config, { isServer }) => {
    // ✅ Prevent Webpack from bundling `node:http` for both client and server
    config.resolve.fallback = {
      ...config.resolve.fallback,
      http: false,
      https: false,
      fs: false,
      net: false,
      tls: false,
      path: false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      "node:http": false, // 🔥 Make sure this is ignored in both server & client
      "node:https": false,
    };

    // ✅ Prevent @prisma/extension-pulse from being bundled in both client & server
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "@prisma/extension-pulse",
        "pino-pretty", "lokijs", "encoding",
      ];
    }

    return config;
  },
  reactStrictMode: true,
  basePath: "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
