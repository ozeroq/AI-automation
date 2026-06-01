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

  // 클릭 시 동작
  external_url?: string; // basic 티어
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
}
