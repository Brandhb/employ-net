import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Processing job:", body);

  return NextResponse.json({ status: "Job completed" });
}
