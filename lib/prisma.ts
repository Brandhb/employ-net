import { PrismaClient as PrismaClientEdge } from "@prisma/client/edge"; // ✅ Serverless (Netlify, Vercel)
import { PrismaClient as PrismaClientStandard } from "@prisma/client"; // ✅ Local development & production
import { withPulse } from "@prisma/extension-pulse/node"; // ✅ Only for local development

const isServerless = process.env.NETLIFY === "true"; // Detect if running on Netlify
const isLocal = process.env.NODE_ENV === "development";

const globalForPrisma = global as unknown as { 
  prisma: PrismaClientStandard | PrismaClientEdge;
};

// ✅ Use Prisma Accelerate's DATABASE_URL for optimized pooling
const databaseUrl = process.env.DATABASE_URL;

// ✅ Use PrismaClientEdge for Netlify (serverless), otherwise PrismaClientStandard
export const prisma = globalForPrisma.prisma || 
  (isServerless 
    ? new PrismaClientEdge({
        datasources: { db: { url: databaseUrl } },
        log: isLocal ? ["query", "info", "warn", "error"] : ["warn", "error"],
      })
    : new PrismaClientStandard({
        datasources: { db: { url: databaseUrl } },
        log: isLocal ? ["query", "info", "warn", "error"] : ["warn", "error"],
      })
  );

// ✅ Enable Prisma Pulse ONLY in local development
if (!isServerless && isLocal) {
  prisma.$extends(
    withPulse({
      apiKey: process.env["PULSE_API_KEY"] as string,
    })
  );
}

// ✅ Persist Prisma client to prevent multiple connections in development
if (isLocal) {
  globalForPrisma.prisma = prisma;
}

// ✅ Graceful shutdown handling
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
