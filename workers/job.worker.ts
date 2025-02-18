import { redisConnection } from "@/lib/redis";

async function processJob() {
  while (true) {
    const result = (await redisConnection.xread(
      "BLOCK",
      0,
      "STREAMS",
      "jobQueue",
      "$"
    )) as [string, [string, string[]][]][] | null;
    if (result) {
      console.log("Processing job result:", result);
      // Do something with the job
    }
  }
}

processJob();
