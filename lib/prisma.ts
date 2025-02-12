'use server';

import { PrismaClient as PrismaClientEdge } from "@prisma/client/edge"; // Serverless (Netlify)
import { PrismaClient as PrismaClientStandard } from "@prisma/client"; // Local development
import { withPulse } from "@prisma/extension-pulse/node"; // ✅ Explicitly use `node` version

const isServerless = process.env.NETLIFY === "true"; // Detect if running on Netlify
const isLocal = process.env.NODE_ENV === "development";

const globalForPrisma = global as unknown as { prisma: PrismaClientStandard | PrismaClientEdge };

// ✅ Prevent Prisma from running on the client
if (typeof window !== "undefined") {
  throw new Error("❌ Prisma should not be imported on the client!");
}

// ✅ Use `@prisma/client/edge` in Netlify, else use `@prisma/client`
export const prisma =
  globalForPrisma.prisma ||
  (isServerless
    ? new PrismaClientEdge({
        datasources: { db: { url: process.env.DATABASE_URL } },
        log: ["warn", "error"], // ✅ Reduce logs in production
      })
    : new PrismaClientStandard()
  );

// ✅ Use Prisma Pulse ONLY in local development (not in Netlify)
if (!isServerless && isLocal) {
  prisma.$extends(
    withPulse({
      apiKey: process.env["PULSE_API_KEY"] as string,
    })
  );
}

// ✅ Persist Prisma client in development mode
if (isLocal) {
  globalForPrisma.prisma = prisma;
}
