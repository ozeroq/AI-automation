/**
 * Stripe Checkout 완료 후 자동 로그인 (라우트 핸들러).
 * Stripe 가 {CHECKOUT_SESSION_ID} 를 채워서 우리 URL 로 리다이렉트.
 * 세션을 retrieve 해서 결제 상태·생성 시각을 검증한 뒤 세션 쿠키 설정.
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AGE_MS = 60 * 60 * 1000; // 1시간 이내 세션만 신뢰

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const nextParam = url.searchParams.get("next");
  const origin = `${url.protocol}//${url.host}`;
  const next =
    nextParam && nextParam.startsWith("/") ? nextParam : "/manage";
  const fallback = `${origin}${next}`;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!sessionId || !key) return NextResponse.redirect(fallback);

  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const isPaid =
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required" ||
      session.status === "complete";
    const ageMs = Date.now() - session.created * 1000;
    if (!isPaid || ageMs > MAX_AGE_MS) {
      return NextResponse.redirect(fallback);
    }

    const email =
      session.customer_email ||
      session.metadata?.email ||
      session.customer_details?.email ||
      null;
    if (email) await setSessionCookie(email);
  } catch (e) {
    console.error("[checkout-success] stripe lookup failed", e);
  }

  return NextResponse.redirect(fallback);
}
