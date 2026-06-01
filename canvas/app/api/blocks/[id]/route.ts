import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBlock, saveBlock } from "@/lib/db";
import { getSessionEmail } from "@/lib/auth";
import { getSubscriber, isProActive } from "@/lib/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const block = await getBlock(id);
  if (!block) return NextResponse.json({ block: null }, { status: 404 });
  return NextResponse.json({ block });
}

const Patch = z.object({
  room_title: z.string().max(80).optional(),
  room_description: z.string().max(2000).optional(),
  external_url: z.union([z.string().url(), z.literal("")]).optional(),
  thumbnail_url: z.string().url().optional(),
  panorama_url: z.union([z.string().url(), z.literal("")]).optional(),
});

const PRO_FIELDS = ["thumbnail_url", "panorama_url"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const sessionEmail = await getSessionEmail();
  if (!sessionEmail) {
    return NextResponse.json(
      { error: "로그인이 필요합니다" },
      { status: 401 },
    );
  }

  const block = await getBlock(id);
  if (!block) {
    return NextResponse.json(
      { error: "블록을 찾을 수 없습니다" },
      { status: 404 },
    );
  }

  if (
    !block.owner_email ||
    block.owner_email.toLowerCase() !== sessionEmail.toLowerCase()
  ) {
    return NextResponse.json(
      { error: "이 블록의 소유자가 아닙니다" },
      { status: 403 },
    );
  }

  let body;
  try {
    body = Patch.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });
  }

  const touchesPro = PRO_FIELDS.some((f) => body[f] !== undefined);
  if (touchesPro) {
    const sub = await getSubscriber(sessionEmail);
    if (!isProActive(sub)) {
      return NextResponse.json(
        {
          error: "이미지·파노라마 교체는 Pro 구독 전용입니다",
          needs_pro: true,
        },
        { status: 402 },
      );
    }
  }

  const updated = {
    ...block,
    thumbnail_url: body.thumbnail_url ?? block.thumbnail_url,
    external_url:
      body.external_url === ""
        ? undefined
        : (body.external_url ?? block.external_url),
    panorama_url:
      body.panorama_url === ""
        ? undefined
        : (body.panorama_url ?? block.panorama_url),
    room:
      body.room_title !== undefined || body.room_description !== undefined
        ? {
            title: body.room_title ?? block.room?.title ?? "",
            owner_name: block.room?.owner_name ?? "익명",
            description:
              body.room_description ?? block.room?.description ?? "",
            media: block.room?.media ?? [],
            contact_url: block.room?.contact_url,
          }
        : block.room,
  };

  await saveBlock(updated);
  return NextResponse.json({ block: updated });
}
