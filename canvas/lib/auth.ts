/**
 * 매직 링크 기반 인증.
 * - signMagicToken: 이메일로 보낼 단기 토큰 (30분)
 * - setSessionCookie: 검증 후 장기 세션 쿠키 (30일)
 * - getSessionEmail: 서버 컴포넌트·라우트에서 현재 사용자 이메일
 */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ||
    "DEV_ONLY_INSECURE_SECRET_DO_NOT_USE_IN_PRODUCTION_AT_LEAST_32_CHARS_LONG",
);
const SESSION_COOKIE = "pc_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30일

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function signMagicToken(email: string): Promise<string> {
  return new SignJWT({ email: normalizeEmail(email), purpose: "magic" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(SECRET);
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.purpose !== "magic") return null;
    const email = payload.email;
    if (typeof email !== "string") return null;
    return email;
  } catch {
    return null;
  }
}

export async function setSessionCookie(email: string): Promise<void> {
  const token = await new SignJWT({
    email: normalizeEmail(email),
    purpose: "session",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SEC,
    path: "/",
  });
}

export async function getSessionEmail(): Promise<string | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.purpose !== "session") return null;
    const email = payload.email;
    return typeof email === "string" ? email : null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
}
