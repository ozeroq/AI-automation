import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().email(),
});

const PRO_PRICE_KRW = 15000;

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "결제 미설정. STRIPE_SECRET_KEY 필요." },
      { status: 503 },
    );
  }

  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "이메일이 올바르지 않습니다" },
      { status: 400 },
    );
  }

  const stripe = new Stripe(key);
  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: body.email,
    line_items: [
      priceId
        ? { price: priceId, quantity: 1 }
        : {
            price_data: {
              currency: "krw",
              unit_amount: PRO_PRICE_KRW,
              recurring: { interval: "month" },
              product_data: {
                name: "PixelRoom Pro",
                description:
                  "룸 콘텐츠 수정·갤러리 확장·서브도메인·분석 멤버십",
              },
            },
            quantity: 1,
          },
    ],
    subscription_data: {
      metadata: { email: body.email },
    },
    metadata: { email: body.email, plan: "pro" },
    success_url: `${origin}/auth/checkout-success?session_id={CHECKOUT_SESSION_ID}&next=${encodeURIComponent("/manage?subscribed=1")}`,
    cancel_url: `${origin}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
