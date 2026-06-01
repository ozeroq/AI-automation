import { NextResponse } from "next/server";
import { listActiveBlocks, seedIfEmpty } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await seedIfEmpty();
  const blocks = await listActiveBlocks();
  return NextResponse.json({ blocks });
}
