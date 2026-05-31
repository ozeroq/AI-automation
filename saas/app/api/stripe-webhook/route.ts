import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whSecret) {
    return NextResponse.json({ error: "Stripe 미설정" }, { status: 503 });
  }

  const stripe = new Stripe(key);
  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch (err) {
    console.error("[webhook] signature verify failed", err);
    return NextResponse.json({ error: "signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      // TODO: 구독 ID 와 user 매핑 저장 (Supabase / Vercel KV)
      console.log("[webhook] subscription started", event.data.object.id);
      break;
    case "customer.subscription.deleted":
      console.log("[webhook] subscription cancelled", event.data.object.id);
      break;
  }
  return NextResponse.json({ received: true });
}
