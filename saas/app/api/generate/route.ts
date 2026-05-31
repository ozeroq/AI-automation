import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generate } from "@/lib/claude";
import { checkLimit } from "@/lib/ratelimit";
import { TOOLS, type ToolSlug } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  tool: z.enum(["cover-letter", "email", "summary"]),
  input: z.record(z.string(), z.string().max(8000)),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "잘못된 요청 형식." }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anon";
  const limit = await checkLimit(`${parsed.tool}:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: "오늘의 무료 사용 한도를 초과했습니다. Pro 로 업그레이드해주세요.",
        reset: limit.reset,
      },
      { status: 429 },
    );
  }

  const tool = TOOLS[parsed.tool as ToolSlug];
  try {
    const output = await generate({
      system: tool.system,
      user: tool.buildUser(parsed.input),
      maxTokens: 2048,
    });
    return NextResponse.json({ output, remaining: limit.remaining });
  } catch (e) {
    console.error("[generate] error", e);
    return NextResponse.json(
      { error: "생성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
