import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signMagicToken } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";

export const runtime = "nodejs";

const Body = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "이메일 형식이 올바르지 않습니다" },
      { status: 400 },
    );
  }

  const token = await signMagicToken(body.email);
  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  const link = `${origin}/auth/verify?token=${encodeURIComponent(token)}`;

  const result = await sendMagicLink(body.email, link);
  return NextResponse.json({
    sent: result.sent,
    debug_link: result.debug_link,
    error: result.error,
  });
}
