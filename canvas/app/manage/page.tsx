"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MeResponse = {
  email: string;
  is_pro: boolean;
  subscription: {
    status: string;
    current_period_end: number;
    plan: string;
  } | null;
  blocks: {
    id: string;
    bx: number;
    by: number;
    bw: number;
    bh: number;
    tier: string;
    title?: string;
    has_panorama: boolean;
  }[];
};

export default function ManagePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<MeResponse | null>(null);
  const [error, setError] = useState("");
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [justPurchased, setJustPurchased] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("email");
    if (params.get("subscribed") === "1") setJustSubscribed(true);
    if (params.get("purchase") === "success") setJustPurchased(true);
    if (e) {
      setEmail(e);
      lookup(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookup(target?: string) {
    const e = (target ?? email).trim();
    if (!e) return;
    setError("");
    setLoading(true);
    try {
      const r = await fetch(`/api/me?email=${encodeURIComponent(e)}`);
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "조회 실패");
      else setInfo(data);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }

  async function openPortal() {
    setError("");
    try {
      const r = await fetch("/api/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "포털 이동 실패");
      else if (data.url) window.location.href = data.url;
    } catch {
      setError("네트워크 오류");
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <Link href="/" className="text-sm opacity-70 hover:underline">
        ← 캔버스로
      </Link>
      <h1 className="text-3xl font-bold mt-4">내 룸 관리</h1>

      {justSubscribed && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-900/40 border border-emerald-700 text-sm">
          🎉 Pro 구독이 시작되었습니다. 이메일로 영수증이 발송됩니다.
        </div>
      )}
      {justPurchased && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-900/40 border border-emerald-700 text-sm">
          🎉 블록 구매가 완료되었습니다. 곧 캔버스에 반영됩니다.
        </div>
      )}

      <p className="text-sm opacity-70 mt-3">
        블록 구매 또는 Pro 구독 시 사용한 이메일을 입력하세요.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder="you@example.com"
          className="flex-1 px-3 py-2 rounded-lg border border-zinc-700 bg-transparent"
        />
        <button
          onClick={() => lookup()}
          disabled={!email || loading}
          className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-400 disabled:opacity-50"
        >
          {loading ? "조회 중..." : "조회"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {info && (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <h2 className="font-semibold">구독 상태</h2>
            {info.is_pro ? (
              <>
                <p className="text-sm opacity-90 mt-1">
                  <span className="px-2 py-0.5 rounded bg-pink-500 text-xs font-semibold mr-2">
                    Pro
                  </span>
                  활성 ·{" "}
                  {info.subscription &&
                    new Date(info.subscription.current_period_end).toLocaleDateString(
                      "ko-KR",
                    )}{" "}
                  까지
                </p>
                <button
                  onClick={openPortal}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
                >
                  결제 정보·해지 관리 →
                </button>
              </>
            ) : (
              <>
                <p className="text-sm opacity-80 mt-1">
                  활성 Pro 구독 없음
                </p>
                <Link
                  href="/pricing"
                  className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-sm"
                >
                  Pro 시작하기 →
                </Link>
              </>
            )}
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <h2 className="font-semibold">소유 블록 ({info.blocks.length})</h2>
            {info.blocks.length === 0 ? (
              <p className="text-sm opacity-70 mt-2">
                이 이메일로 구매한 블록이 없습니다.{" "}
                <Link href="/" className="underline">
                  캔버스에서 영역 선택 →
                </Link>
              </p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {info.blocks.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-mono opacity-70">
                        ({b.bx},{b.by}) {b.bw}×{b.bh}
                      </span>{" "}
                      {b.title && <span>· {b.title}</span>}{" "}
                      {b.has_panorama && (
                        <span className="text-xs text-pink-400">· 360°</span>
                      )}
                    </div>
                    <Link
                      href={`/room/${b.id}`}
                      className="text-xs underline opacity-70 hover:opacity-100"
                    >
                      룸 보기
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs opacity-60 mt-4">
              ※ 룸 콘텐츠 직접 수정 UI는 곧 제공됩니다 (Pro 전용).
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
