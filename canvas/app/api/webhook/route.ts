import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { saveBlock, isAreaFree } from "@/lib/db";
import {
  getSubscriberByCustomerId,
  saveSubscriber,
} from "@/lib/subscriptions";
import type { Block, Subscriber, SubscriptionStatus } from "@/lib/types";
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

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.mode === "payment") {
        await handleBlockPurchase(session);
      } else if (session.mode === "subscription") {
        await handleSubscriptionStarted(stripe, session);
      }
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await handleSubscriptionChange(stripe, event.data.object);
    }
  } catch (e) {
    console.error("[webhook] handler error", e);
    return NextResponse.json({ error: "handler" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleBlockPurchase(session: Stripe.Checkout.Session) {
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
    return;
  }
  const block: Block = {
    id: randomUUID().slice(0, 8),
    ...area,
    tier: (m.tier as Tier) || "basic",
    thumbnail_url: m.thumbnail_url ?? "",
    owner_email: (m.owner_email || session.customer_email) ?? undefined,
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
}

async function handleSubscriptionStarted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const email = (session.customer_email ?? session.metadata?.email ?? "").trim();
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  if (!email || !customerId || !subscriptionId) {
    console.error("[webhook] subscription session missing fields", {
      email,
      customerId,
      subscriptionId,
    });
    return;
  }
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const sub: Subscriber = {
    email,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    status: subscription.status as SubscriptionStatus,
    current_period_end: subscription.current_period_end * 1000,
    created_at: Date.now(),
    plan: "pro",
  };
  await saveSubscriber(sub);
}

async function handleSubscriptionChange(
  stripe: Stripe,
  subscription: Stripe.Subscription,
) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const existing = await getSubscriberByCustomerId(customerId);
  if (existing) {
    await saveSubscriber({
      ...existing,
      status: subscription.status as SubscriptionStatus,
      current_period_end: subscription.current_period_end * 1000,
    });
    return;
  }
  // 최초 추적이 안된 케이스: 고객 정보에서 이메일 조회
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return;
  const email = (customer as Stripe.Customer).email;
  if (!email) return;
  await saveSubscriber({
    email,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status as SubscriptionStatus,
    current_period_end: subscription.current_period_end * 1000,
    created_at: Date.now(),
    plan: "pro",
  });
}
