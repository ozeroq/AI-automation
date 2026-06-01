"use client";

import Link from "next/link";
import { useState } from "react";

type Result = {
  sent: boolean;
  debug_link?: string;
  error?: string;
};

export default function LoginCard({
  authStatus,
  prefillEmail,
}: {
  authStatus?: string;
  prefillEmail?: string;
}) {
  const [email, setEmail] = useState(prefillEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      setResult(data);
    } catch {
      setResult({ sent: false, error: "네트워크 오류" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <Link href="/" className="text-sm opacity-70 hover:underline">
        ← 캔버스로
      </Link>
      <h1 className="text-2xl font-bold mt-4">내 룸 관리</h1>
      <p className="text-sm opacity-70 mt-1">
        블록 구매·Pro 구독 시 사용한 이메일로 로그인 링크를 보내드립니다.
      </p>

      {authStatus === "expired" && (
        <p className="mt-3 p-2 rounded-lg bg-yellow-900/40 text-yellow-200 text-sm">
          링크가 만료되었습니다. 다시 요청해주세요.
        </p>
      )}
      {authStatus === "missing" && (
        <p className="mt-3 p-2 rounded-lg bg-yellow-900/40 text-yellow-200 text-sm">
          유효한 로그인 링크가 아닙니다.
        </p>
      )}
      {authStatus === "required" && (
        <p className="mt-3 p-2 rounded-lg bg-yellow-900/40 text-yellow-200 text-sm">
          이 페이지는 로그인이 필요합니다.
        </p>
      )}

      <form onSubmit={submit} className="mt-5 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3 py-2.5 rounded-lg border border-zinc-700 bg-transparent"
        />
        <button
          type="submit"
          disabled={!email || loading}
          className="w-full px-4 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-400 disabled:opacity-50 font-medium"
        >
          {loading ? "전송 중..." : "로그인 링크 받기"}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm">
          {result.sent ? (
            <p>✅ 이메일을 확인하세요 (30분 유효).</p>
          ) : result.error ? (
            <p className="text-red-400">{result.error}</p>
          ) : (
            <>
              <p className="text-yellow-400">
                ⚠️ 이메일 서비스가 설정되지 않았습니다 (개발 환경).
              </p>
              {result.debug_link && (
                <a
                  href={result.debug_link}
                  className="block mt-2 text-pink-400 break-all underline"
                >
                  {result.debug_link}
                </a>
              )}
            </>
          )}
        </div>
      )}

      <p className="mt-6 text-xs opacity-60">
        아직 블록이 없나요?{" "}
        <Link href="/" className="underline">
          캔버스에서 영역 선택 →
        </Link>
      </p>
    </main>
  );
}
