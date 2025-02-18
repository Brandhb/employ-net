import { analyticsQueue } from "./analyticsQueue";

export async function scheduleAnalyticsRefresh() {
  console.log("⏳ Scheduling analytics refresh job...");

  // ✅ Use `getJobSchedulers()` instead of `getRepeatableJobs()`
  const existingSchedulers = await analyticsQueue.getJobSchedulers();
  
  if (existingSchedulers.length === 0) {
    await analyticsQueue.add(
      "refresh",
      {},
      { repeat: { every: 10 * 60 * 1000 } } // Run every 10 minutes
    );
  }
}
