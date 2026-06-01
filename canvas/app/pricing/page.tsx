"use client";

import Link from "next/link";
import { useState } from "react";
import { TIER_LABELS, TIER_PRICES_KRW, formatKrw } from "@/lib/pricing";

const TIER_FEATURES: Record<string, string[]> = {
  basic: ["썸네일 1장", "외부 사이트로 직접 이동", "캔버스 호버 시 이름 표시"],
  gallery: [
    "단독 룸 페이지 (/room/[id])",
    "제목·소개·외부 링크",
    "(곧) 갤러리 이미지 5장",
  ],
  exhibition: [
    "360° 파노라마 룸 (Pannellum)",
    "포털 전환 애니메이션",
    "단독 풀스크린 룸 URL",
  ],
  premium: [
    "Exhibition 전 기능",
    "커스텀 HTML 임베드",
    "중앙·코너 등 프리미엄 위치 우선권",
  ],
};

const PRO_FEATURES = [
  "룸 제목·소개·파노라마 무제한 수정",
  "갤러리 이미지·영상 추가 업로드",
  "커스텀 서브도메인 (yourname.pixelroom.xyz)",
  "방문자 분석 (일별 클릭·체류)",
  "캔버스 호버 시 Pro 배지 표시",
  "신규 기능 우선 접근",
];

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startSubscription() {
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "결제 시작 실패");
      else if (data.url) window.location.href = data.url;
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }

  const tiers = ["basic", "gallery", "exhibition", "premium"] as const;

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <Link href="/" className="text-sm opacity-70 hover:underline">
        ← 캔버스로
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold mt-4">가격</h1>
      <p className="text-sm opacity-70 mt-1">
        블록 구매는 1회성. Pro 구독은 룸을 계속 운영·확장하기 위한 멤버십.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">1. 블록 구매 (1회성)</h2>
        <p className="text-sm opacity-70 mt-1">
          캔버스에서 영역을 드래그해 시작하세요. 가격은 (블록 수 × 티어 단가) ×
          위치 프리미엄.
        </p>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tiers.map((t) => (
            <div
              key={t}
              className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col"
            >
              <div className="text-sm opacity-70">{TIER_LABELS[t].split(" (")[0]}</div>
              <div className="font-mono text-2xl mt-1">
                {formatKrw(TIER_PRICES_KRW[t])}
                <span className="text-xs opacity-60"> / 블록</span>
              </div>
              <ul className="mt-4 space-y-1 text-sm flex-1">
                {TIER_FEATURES[t]?.map((f) => (
                  <li key={f} className="opacity-90">
                    · {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/"
                className="mt-4 text-center px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
              >
                캔버스에서 영역 선택 →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-transparent border border-pink-500/40">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-pink-500 text-xs font-semibold">
            NEW
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold">PixelRoom Pro</h2>
          <span className="text-base opacity-80">
            <span className="font-mono">{formatKrw(15000)}</span>
            <span className="text-xs opacity-70"> / 월</span>
          </span>
        </div>
        <p className="mt-2 text-sm opacity-90">
          블록을 한 번 산 뒤에도 룸을 계속 가꾸고 싶은 분들을 위한 구독.
          언제든 해지 가능.
        </p>

        <ul className="mt-5 grid sm:grid-cols-2 gap-2 text-sm">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex gap-2 items-start">
              <span className="text-pink-400 mt-0.5">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="px-3 py-2.5 rounded-lg border border-zinc-700 bg-zinc-950/50 flex-1 min-w-[220px]"
          />
          <button
            onClick={startSubscription}
            disabled={!email || loading}
            className="px-6 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-400 disabled:opacity-50 font-medium"
          >
            {loading ? "이동 중..." : "Pro 시작하기 →"}
          </button>
        </div>
        <p className="text-xs opacity-70 mt-3">
          ※ 블록을 구매할 때 사용한 이메일과 동일하게 입력하세요. 그래야 본인
          블록과 자동 매칭됩니다.
        </p>
        {error && (
          <p className="text-xs text-red-400 mt-2">{error}</p>
        )}
      </section>

      <section className="mt-10 text-center text-sm opacity-70">
        이미 Pro인가요?{" "}
        <Link href="/manage" className="underline">
          내 룸 관리 →
        </Link>
      </section>
    </main>
  );
}
