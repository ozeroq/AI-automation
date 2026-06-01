"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DashBlock = {
  id: string;
  bx: number;
  by: number;
  bw: number;
  bh: number;
  tier: string;
  title?: string;
  has_panorama: boolean;
};

type Props = {
  email: string;
  isPro: boolean;
  subscription: { status: string; current_period_end: number } | null;
  blocks: DashBlock[];
  flashSubscribed: boolean;
  flashPurchased: boolean;
};

export default function Dashboard({
  email,
  isPro,
  subscription,
  blocks,
  flashSubscribed,
  flashPurchased,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function openPortal() {
    setBusy(true);
    try {
      const r = await fetch("/api/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "포털 이동 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="text-sm opacity-70 hover:underline">
          ← 캔버스로
        </Link>
        <button
          onClick={logout}
          disabled={busy}
          className="text-xs opacity-70 hover:opacity-100"
        >
          로그아웃 · <span className="font-mono">{email}</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold mt-4">내 룸</h1>

      {flashSubscribed && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-900/40 border border-emerald-700 text-sm">
          🎉 Pro 구독이 시작되었습니다.
        </div>
      )}
      {flashPurchased && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-900/40 border border-emerald-700 text-sm">
          🎉 블록 구매가 완료되었습니다. 캔버스에 곧 반영됩니다.
        </div>
      )}

      <section className="mt-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-semibold flex items-center gap-2">
            구독 상태
            {isPro && (
              <span className="px-2 py-0.5 rounded bg-pink-500 text-xs font-semibold">
                Pro
              </span>
            )}
          </h2>
          {isPro ? (
            <button
              onClick={openPortal}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
            >
              결제·해지 관리 →
            </button>
          ) : (
            <Link
              href="/pricing"
              className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-sm"
            >
              Pro 시작하기 →
            </Link>
          )}
        </div>
        {isPro && subscription && (
          <p className="text-sm opacity-80 mt-1">
            활성 ·{" "}
            {new Date(subscription.current_period_end).toLocaleDateString(
              "ko-KR",
            )}{" "}
            까지
          </p>
        )}
      </section>

      <section className="mt-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <h2 className="font-semibold">소유 블록 ({blocks.length})</h2>
        {blocks.length === 0 ? (
          <p className="text-sm opacity-70 mt-2">
            이 이메일로 구매한 블록이 없습니다.{" "}
            <Link href="/" className="underline">
              캔버스에서 영역 선택 →
            </Link>
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-800/60">
            {blocks.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="text-sm min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono opacity-70 text-xs">
                      ({b.bx},{b.by}) {b.bw}×{b.bh}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] uppercase opacity-70">
                      {b.tier}
                    </span>
                    {b.has_panorama && (
                      <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[10px]">
                        360°
                      </span>
                    )}
                  </div>
                  {b.title && (
                    <div className="opacity-90 mt-1 truncate">{b.title}</div>
                  )}
                </div>
                <div className="flex gap-2 text-xs shrink-0">
                  <Link
                    href={`/manage/blocks/${b.id}`}
                    className="px-2.5 py-1.5 rounded bg-pink-500/20 text-pink-300 hover:bg-pink-500/30"
                  >
                    편집
                  </Link>
                  <Link
                    href={`/room/${b.id}`}
                    target="_blank"
                    className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700"
                  >
                    미리보기 →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
