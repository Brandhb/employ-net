import * as Sentry from "@sentry/nextjs";

export function logError(error: any, context: string = "Unknown") {
  console.error(`[❌ ${new Date().toISOString()}] Error in ${context}:`, error);
  Sentry.captureException(error, {
    tags: { context },
  });
}

export function logInfo(message: string, data?: any) {
  console.log(`[ℹ️ ${new Date().toISOString()}] ${message}`);
  Sentry.captureMessage(message, {
    level: "info",
    extra: data,
  });
}
