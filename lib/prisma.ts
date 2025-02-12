import { PrismaClient as PrismaClientEdge } from "@prisma/client/edge"; // ✅ Serverless (Netlify)
import { PrismaClient as PrismaClientStandard } from "@prisma/client"; // ✅ Local development
import { withPulse } from "@prisma/extension-pulse/node"; // ✅ Only for local development

const isServerless = process.env.NETLIFY === "true"; // Detect if running on Netlify
const isLocal = process.env.NODE_ENV === "development";

// ✅ Use `@prisma/client/edge` for Netlify, else use `@prisma/client`
export const prisma = isServerless
  ? new PrismaClientEdge({
      datasources: { db: { url: process.env.DATABASE_URL } },
      log: ["warn", "error"], // ✅ Reduce logs in production
    })
  : new PrismaClientStandard();

// ✅ Enable Prisma Pulse ONLY in local development
if (!isServerless && isLocal) {
  prisma.$extends(
    withPulse({
      apiKey: process.env["PULSE_API_KEY"] as string,
    })
  );
}

// ✅ In local development, persist Prisma client globally to prevent multiple connections
if (isLocal) {
  const globalForPrisma = global as unknown as { prisma: PrismaClientStandard };
  globalForPrisma.prisma = prisma;
}
