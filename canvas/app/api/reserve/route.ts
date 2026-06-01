import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clampArea } from "@/lib/grid";
import { isAreaFree } from "@/lib/db";
import { TIER_PRICES_KRW, priceKrw, type Tier } from "@/lib/pricing";

export const runtime = "nodejs";

const Body = z.object({
  bx: z.number().int().min(0).max(99),
  by: z.number().int().min(0).max(99),
  bw: z.number().int().min(1).max(100),
  bh: z.number().int().min(1).max(100),
  tier: z.enum(["basic", "gallery", "exhibition", "premium"] as const),
});

export async function POST(req: NextRequest) {
  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  const area = clampArea({ bx: body.bx, by: body.by, bw: body.bw, bh: body.bh });
  const free = await isAreaFree(area);
  if (!free) {
    return NextResponse.json(
      { error: "선택한 영역에 이미 구매된 블록이 있습니다." },
      { status: 409 },
    );
  }
  const price = priceKrw(area, body.tier as Tier);
  return NextResponse.json({
    area,
    tier: body.tier,
    price_krw: price,
    base_price_krw: TIER_PRICES_KRW[body.tier as Tier],
  });
}
