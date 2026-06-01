import type { BlockArea } from "./grid";
import { GRID_SIZE, areaBlocks } from "./grid";

export type Tier = "basic" | "gallery" | "exhibition" | "premium";

export const TIER_PRICES_KRW: Record<Tier, number> = {
  basic: 1000, // 이미지 + 외부 링크
  gallery: 10000, // 이미지 5장 + 룸
  exhibition: 30000, // 풀 룸 + 영상·임베드
  premium: 100000, // 커스텀 HTML
};

export const TIER_LABELS: Record<Tier, string> = {
  basic: "기본 (이미지 + 외부 링크)",
  gallery: "갤러리 (이미지 5장 + 룸)",
  exhibition: "전시 (풀 룸 + 영상)",
  premium: "프리미엄 (커스텀 HTML)",
};

// 중앙에 가까울수록 +프리미엄 (최대 +50%)
export function positionMultiplier(area: BlockArea): number {
  const cx = area.bx + area.bw / 2;
  const cy = area.by + area.bh / 2;
  const center = GRID_SIZE / 2;
  const maxDist = Math.SQRT2 * (GRID_SIZE / 2);
  const dist = Math.hypot(cx - center, cy - center);
  const proximity = 1 - dist / maxDist; // 0..1
  return 1 + proximity * 0.5;
}

export function priceKrw(area: BlockArea, tier: Tier): number {
  const base = TIER_PRICES_KRW[tier] * areaBlocks(area);
  const multiplied = base * positionMultiplier(area);
  return Math.round(multiplied / 100) * 100; // 100원 단위로 반올림
}

export function formatKrw(n: number): string {
  return "₩" + n.toLocaleString("ko-KR");
}
