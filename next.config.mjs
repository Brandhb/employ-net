import { withSentryConfig } from "@sentry/nextjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    googleAnalyticsId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
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
        "node:http": false,
        "node:https": false,
      };
    }

    // ✅ Exclude Prisma Pulse in production builds
    if (process.env.NODE_ENV === "production") {
      config.externals = [
        ...(config.externals || []),
        "@prisma/extension-pulse",
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

export default withSentryConfig(nextConfig, {
  org: "employ-net",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
