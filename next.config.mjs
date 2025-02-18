import {withSentryConfig} from "@sentry/nextjs";
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
        uuid: require.resolve("uuid"), // ✅ Forces Webpack to use the correct version
        "bullmq/node_modules/uuid": require.resolve("uuid"), // ✅ Fix BullMQ's internal uuid
      };
    }

    // ✅ Exclude Prisma Pulse from both server & client builds
    config.externals = [
      ...(config.externals || []),
      "@prisma/extension-pulse",
      "pino-pretty", "lokijs", "encoding",
    ];

    return config;
  },
  reactStrictMode: true,
  basePath: "",
  images: {
    unoptimized: true,
  },
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://github.com/getsentry/sentry-webpack-plugin#options

org: "employ-net",
project: "javascript-nextjs",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
// tunnelRoute: "/monitoring",

// Hides source maps from generated client bundles
hideSourceMaps: true,

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});