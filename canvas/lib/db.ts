/**
 * 블록 저장소.
 * Upstash Redis가 설정돼 있으면 영구 저장, 없으면 in-memory + seed 파일.
 */
import { Redis } from "@upstash/redis";
import type { Block, BlockSummary } from "./types";
import { areasOverlap, type BlockArea } from "./grid";

const HAS_REDIS =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = HAS_REDIS ? Redis.fromEnv() : null;
const KEY_INDEX = "pc:blocks:index";
const keyBlock = (id: string) => `pc:block:${id}`;

const memory = new Map<string, Block>();

function summarize(b: Block): BlockSummary {
  return {
    id: b.id,
    bx: b.bx,
    by: b.by,
    bw: b.bw,
    bh: b.bh,
    thumbnail_url: b.thumbnail_url,
    owner_name: b.room?.owner_name,
    has_room: !!b.room,
  };
}

export async function listActiveBlocks(): Promise<BlockSummary[]> {
  if (redis) {
    const ids = (await redis.smembers(KEY_INDEX)) as string[];
    if (ids.length === 0) return [];
    const blocks = await Promise.all(
      ids.map((id) => redis.get<Block>(keyBlock(id))),
    );
    return blocks
      .filter((b): b is Block => !!b && b.status === "active")
      .map(summarize);
  }
  return [...memory.values()].filter((b) => b.status === "active").map(summarize);
}

export async function getBlock(id: string): Promise<Block | null> {
  if (redis) return (await redis.get<Block>(keyBlock(id))) ?? null;
  return memory.get(id) ?? null;
}

export async function saveBlock(block: Block): Promise<void> {
  if (redis) {
    await redis.set(keyBlock(block.id), block);
    await redis.sadd(KEY_INDEX, block.id);
    return;
  }
  memory.set(block.id, block);
}

export async function isAreaFree(area: BlockArea): Promise<boolean> {
  const blocks = await listActiveBlocks();
  return !blocks.some((b) => areasOverlap(area, b));
}

/** 첫 방문자에게 캔버스가 비어보이지 않게, 데모 시드 자동 주입. */
export async function seedIfEmpty(): Promise<void> {
  const existing = await listActiveBlocks();
  if (existing.length > 0) return;

  const seeds: Block[] = [
    {
      id: "seed-welcome",
      bx: 45,
      by: 45,
      bw: 10,
      bh: 10,
      tier: "exhibition",
      thumbnail_url: "/seed/welcome.svg",
      created_at: Date.now(),
      status: "active",
      room: {
        title: "PixelRoom에 오신 걸 환영합니다",
        owner_name: "운영팀",
        description:
          "이 캔버스의 100만 픽셀이 곧 10,000명의 전시 룸이 됩니다. 빈 영역을 드래그해 본인의 룸을 만들어보세요.",
        media: [],
      },
    },
  ];
  for (const s of seeds) await saveBlock(s);
}
