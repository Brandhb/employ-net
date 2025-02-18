import { NextResponse } from "next/server";
import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: process.env.UPSTASH_QSTASH_TOKEN!,
});

export async function GET() {
  const response = await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/process-job`, // The route to handle the job
    body: { message: "Run this job in the background" },
    delay: 60, // Run after 60 seconds
  });

  return NextResponse.json({ status: "Job scheduled", id: response.messageId });
}
