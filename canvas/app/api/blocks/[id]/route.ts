import { NextResponse } from "next/server";
import { getBlock } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const block = await getBlock(id);
  if (!block) return NextResponse.json({ block: null }, { status: 404 });
  return NextResponse.json({ block });
}
