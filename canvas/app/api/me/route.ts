import { NextRequest, NextResponse } from "next/server";
import { listBlocksByEmail } from "@/lib/db";
import { getSubscriber, isProActive } from "@/lib/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email") ?? "";
  if (!email) {
    return NextResponse.json(
      { error: "email 파라미터 필요" },
      { status: 400 },
    );
  }

  const [sub, blocks] = await Promise.all([
    getSubscriber(email),
    listBlocksByEmail(email),
  ]);

  return NextResponse.json({
    email,
    is_pro: isProActive(sub),
    subscription: sub
      ? {
          status: sub.status,
          current_period_end: sub.current_period_end,
          plan: sub.plan,
        }
      : null,
    blocks: blocks.map((b) => ({
      id: b.id,
      bx: b.bx,
      by: b.by,
      bw: b.bw,
      bh: b.bh,
      tier: b.tier,
      title: b.room?.title,
      has_panorama: !!b.panorama_url,
    })),
  });
}
