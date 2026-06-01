/**
 * Pro 구독자 저장소.
 * Block.owner_email ↔ Subscriber.email 로 매칭.
 */
import { Redis } from "@upstash/redis";
import type { Subscriber } from "./types";

const HAS_REDIS =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = HAS_REDIS ? Redis.fromEnv() : null;
const KEY_SUB_INDEX = "pc:sub:index";
const subKey = (email: string) => `pc:sub:${email.toLowerCase()}`;
const customerKey = (cid: string) => `pc:sub:cust:${cid}`;

const memory = new Map<string, Subscriber>();
const memoryByCustomer = new Map<string, string>(); // cid → email

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getSubscriber(email: string): Promise<Subscriber | null> {
  if (!email) return null;
  const e = normalizeEmail(email);
  if (redis) return (await redis.get<Subscriber>(subKey(e))) ?? null;
  return memory.get(e) ?? null;
}

export async function getSubscriberByCustomerId(
  customerId: string,
): Promise<Subscriber | null> {
  if (!customerId) return null;
  if (redis) {
    const email = await redis.get<string>(customerKey(customerId));
    if (!email) return null;
    return getSubscriber(email);
  }
  const email = memoryByCustomer.get(customerId);
  if (!email) return null;
  return getSubscriber(email);
}

export async function saveSubscriber(sub: Subscriber): Promise<void> {
  const e = normalizeEmail(sub.email);
  const normalized = { ...sub, email: e };
  if (redis) {
    await redis.set(subKey(e), normalized);
    await redis.set(customerKey(sub.stripe_customer_id), e);
    await redis.sadd(KEY_SUB_INDEX, e);
    return;
  }
  memory.set(e, normalized);
  memoryByCustomer.set(sub.stripe_customer_id, e);
}

export function isProActive(sub: Subscriber | null | undefined): boolean {
  if (!sub) return false;
  if (sub.status !== "active" && sub.status !== "trialing") return false;
  return sub.current_period_end > Date.now();
}

/** 캔버스 렌더링 시 한 번 호출 → 모든 활성 Pro 이메일 집합 */
export async function getActiveProEmails(): Promise<Set<string>> {
  if (redis) {
    const emails = (await redis.smembers(KEY_SUB_INDEX)) as string[];
    if (emails.length === 0) return new Set();
    const subs = await Promise.all(
      emails.map((e) => redis.get<Subscriber>(subKey(e))),
    );
    return new Set(
      subs
        .filter((s): s is Subscriber => isProActive(s))
        .map((s) => s.email),
    );
  }
  return new Set(
    [...memory.values()].filter(isProActive).map((s) => s.email),
  );
}
