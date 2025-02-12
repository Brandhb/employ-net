
import { PrismaClient as PrismaClientEdge } from "@prisma/client/edge"; // For serverless (Netlify)
import { PrismaClient as PrismaClientStandard } from "@prisma/client"; // For local development
import { withPulse } from "@prisma/extension-pulse/node";

const isServerless = process.env.NETLIFY === "true"; // Detect if running on Netlify
const globalForPrisma = global as unknown as { prisma: PrismaClientStandard | PrismaClientEdge };

// ✅ Ensure this only runs on the server
if (typeof window !== "undefined") {
  throw new Error("❌ Prisma should not be imported on the client!");
}

// ✅ Use `@prisma/client/edge` only in Netlify (serverless), else use standard Prisma
export const prisma =
  globalForPrisma.prisma ||
  (isServerless
    ? new PrismaClientEdge({
        datasources: { db: { url: process.env.DATABASE_URL } },
        log: ["query", "info", "warn", "error"], // ✅ Improve logs for debugging
      })
    : new PrismaClientStandard()
  ).$extends(
    withPulse({
      apiKey: process.env["PULSE_API_KEY"] as string,
    })
  );

// ✅ Only persist Prisma client in development (avoiding multiple instances)
if (!isServerless && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
