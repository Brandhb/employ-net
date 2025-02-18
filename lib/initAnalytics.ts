import { scheduleAnalyticsRefresh } from "@/lib/scheduler";
import "server-only";

if (!(globalThis as any).__analytics_initialized) {
  (globalThis as any).__analytics_initialized = true;

  (async () => {
    console.log(`🚀 Initializing Analytics Background Jobs...`);
    await scheduleAnalyticsRefresh();
  })();
}
