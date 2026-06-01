import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { getSubscriber } from "@/lib/subscriptions";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key)
    return NextResponse.json({ error: "결제 미설정" }, { status: 503 });

  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "이메일이 올바르지 않습니다" },
      { status: 400 },
    );
  }

  const sub = await getSubscriber(body.email);
  if (!sub) {
    return NextResponse.json(
      { error: "이 이메일로 등록된 구독을 찾지 못했습니다." },
      { status: 404 },
    );
  }

  const stripe = new Stripe(key);
  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/manage?email=${encodeURIComponent(body.email)}`,
  });

  return NextResponse.json({ url: session.url });
}
