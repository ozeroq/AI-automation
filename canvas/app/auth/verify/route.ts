import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, verifyMagicToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const next = url.searchParams.get("next");
  const origin = `${url.protocol}//${url.host}`;

  if (!token) {
    return NextResponse.redirect(`${origin}/manage?auth=missing`);
  }
  const email = await verifyMagicToken(token);
  if (!email) {
    return NextResponse.redirect(`${origin}/manage?auth=expired`);
  }
  await setSessionCookie(email);
  const target =
    next && next.startsWith("/")
      ? `${origin}${next}`
      : `${origin}/manage?auth=success`;
  return NextResponse.redirect(target);
}
