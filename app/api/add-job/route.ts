import { redisConnection } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
  await redisConnection.xadd("jobQueue", "*", "message", "Run background job");
  return NextResponse.json({ status: "Job added" });
}
