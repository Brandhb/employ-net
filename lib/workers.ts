import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { sendJobFailureAlert } from "@/lib/email";
import { fetchAnalyticsData } from "@/app/actions/analytics";

// ✅ Generic Worker for Analytics Jobs
export const analyticsWorker = new Worker(
  "analytics-refresh",
  async () => {
    console.log("🔄 Running analytics refresh job...");
    await fetchAnalyticsData();
  },
  { connection: redisConnection }
);

// ✅ Monitor All Jobs for Failures
analyticsWorker.on("failed", async (job, err) => {
  console.error(`❌ Job Failed: ${job?.name} - ${err.message}`);
  
  // ✅ Send email alert when a job fails
  await sendJobFailureAlert(job?.name || "", err.message);
});
