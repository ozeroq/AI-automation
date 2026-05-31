import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error:
          "Stripe 미설정. .env 에 STRIPE_SECRET_KEY 추가 후 사용 가능합니다.",
      },
      { status: 503 },
    );
  }

  const stripe = new Stripe(key);
  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "krw",
          recurring: { interval: "month" },
          product_data: { name: "AI 도구 Pro" },
          unit_amount: 9900,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/?status=success`,
    cancel_url: `${origin}/pricing?status=cancelled`,
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
