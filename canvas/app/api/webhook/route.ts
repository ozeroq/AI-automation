import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { saveBlock, isAreaFree } from "@/lib/db";
import type { Block } from "@/lib/types";
import type { Tier } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whSecret) {
    return NextResponse.json({ error: "미설정" }, { status: 503 });
  }
  const stripe = new Stripe(key);
  const sig = req.headers.get("stripe-signature") ?? "";
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch (e) {
    console.error("[webhook] signature failed", e);
    return NextResponse.json({ error: "signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  const m = session.metadata ?? {};
  const area = {
    bx: parseInt(m.bx ?? "0", 10),
    by: parseInt(m.by ?? "0", 10),
    bw: parseInt(m.bw ?? "0", 10),
    bh: parseInt(m.bh ?? "0", 10),
  };
  if (!(await isAreaFree(area))) {
    console.error("[webhook] area no longer free", area);
    // TODO: 환불 처리
    return NextResponse.json({ error: "area taken" }, { status: 409 });
  }

  const block: Block = {
    id: randomUUID().slice(0, 8),
    ...area,
    tier: (m.tier as Tier) || "basic",
    thumbnail_url: m.thumbnail_url ?? "",
    external_url: m.external_url || undefined,
    panorama_url: m.panorama_url || undefined,
    created_at: Date.now(),
    status: "active",
    room: m.room_title
      ? {
          title: m.room_title,
          owner_name: m.owner_name ?? "익명",
          description: m.room_description ?? "",
          media: [],
        }
      : undefined,
  };
  await saveBlock(block);
  return NextResponse.json({ received: true, blockId: block.id });
}
