import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { clampArea } from "@/lib/grid";
import { isAreaFree } from "@/lib/db";
import { priceKrw, type Tier } from "@/lib/pricing";

export const runtime = "nodejs";

const Body = z.object({
  bx: z.number().int().min(0).max(99),
  by: z.number().int().min(0).max(99),
  bw: z.number().int().min(1).max(100),
  bh: z.number().int().min(1).max(100),
  tier: z.enum(["basic", "gallery", "exhibition", "premium"] as const),
  owner_name: z.string().min(1).max(40),
  external_url: z.string().url().optional(),
  thumbnail_url: z.string().url(),
  room_title: z.string().max(80).optional(),
  room_description: z.string().max(2000).optional(),
  panorama_url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "결제 미설정. .env 에 STRIPE_SECRET_KEY 추가 필요." },
      { status: 503 },
    );
  }

  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });
  }
  const area = clampArea({ bx: body.bx, by: body.by, bw: body.bw, bh: body.bh });
  if (!(await isAreaFree(area))) {
    return NextResponse.json({ error: "영역이 이미 점유됨" }, { status: 409 });
  }
  const price = priceKrw(area, body.tier as Tier);

  const stripe = new Stripe(key);
  const origin =
    req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "krw",
          unit_amount: price,
          product_data: {
            name: `PixelRoom ${area.bw}×${area.bh} (${body.tier})`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      bx: String(area.bx),
      by: String(area.by),
      bw: String(area.bw),
      bh: String(area.bh),
      tier: body.tier,
      owner_name: body.owner_name,
      external_url: body.external_url ?? "",
      thumbnail_url: body.thumbnail_url,
      room_title: body.room_title ?? "",
      room_description: body.room_description ?? "",
      panorama_url: body.panorama_url ?? "",
    },
    success_url: `${origin}/?purchase=success`,
    cancel_url: `${origin}/buy?bx=${area.bx}&by=${area.by}&bw=${area.bw}&bh=${area.bh}`,
  });

  return NextResponse.json({ url: session.url });
}
