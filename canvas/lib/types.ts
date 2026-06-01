import type { Tier } from "./pricing";

export type RoomMedia =
  | { kind: "image"; url: string; caption?: string }
  | { kind: "video"; url: string; caption?: string }
  | { kind: "embed"; html: string };

export interface Block {
  id: string;
  bx: number;
  by: number;
  bw: number;
  bh: number;
  tier: Tier;

  // 캔버스에 표시될 썸네일 (필수)
  thumbnail_url: string;

  // 소유자 이메일 (Pro 구독 매칭 + 룸 관리 인증용)
  owner_email?: string;

  // 클릭 시 동작
  external_url?: string; // basic 티어

  // 360° 등각투영 파노라마 이미지 URL (exhibition/premium 티어)
  // 있으면 클릭 시 포털 전환 → Pannellum 뷰어
  panorama_url?: string;

  room?: {
    title: string;
    owner_name: string;
    description: string;
    media: RoomMedia[];
    contact_url?: string;
  };

  created_at: number;
  status: "pending" | "active" | "removed";
}

export interface BlockSummary {
  id: string;
  bx: number;
  by: number;
  bw: number;
  bh: number;
  thumbnail_url: string;
  owner_name?: string;
  has_room: boolean;
  has_panorama: boolean;
  is_pro: boolean;
}

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid";

export interface Subscriber {
  email: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  current_period_end: number; // unix ms
  created_at: number;
  plan: "pro";
}
