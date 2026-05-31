/**
 * Upstash Redis 가 설정돼 있으면 분산 rate limit, 없으면 in-memory.
 * 무료 티어로 시작 → 트래픽 늘면 Upstash 무료 한도(10k/day) 로 자동 분산.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const HAS_UPSTASH =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const upstash = HAS_UPSTASH
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.fixedWindow(3, "1 d"),
      analytics: true,
      prefix: "rl:free",
    })
  : null;

const memory = new Map<string, { count: number; reset: number }>();

export async function checkLimit(
  identifier: string,
): Promise<{ ok: boolean; remaining: number; reset: number }> {
  if (upstash) {
    const r = await upstash.limit(identifier);
    return { ok: r.success, remaining: r.remaining, reset: r.reset };
  }
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const cur = memory.get(identifier);
  if (!cur || cur.reset < now) {
    memory.set(identifier, { count: 1, reset: now + day });
    return { ok: true, remaining: 2, reset: now + day };
  }
  if (cur.count >= 3) return { ok: false, remaining: 0, reset: cur.reset };
  cur.count += 1;
  return { ok: true, remaining: 3 - cur.count, reset: cur.reset };
}
