"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BlockArea } from "@/lib/grid";
import { TIER_LABELS, TIER_PRICES_KRW, formatKrw, priceKrw, type Tier } from "@/lib/pricing";

const TIERS: Tier[] = ["basic", "gallery", "exhibition", "premium"];

export default function BuyClient({ area }: { area: BlockArea }) {
  const [tier, setTier] = useState<Tier>("basic");
  const [ownerName, setOwnerName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [roomTitle, setRoomTitle] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);

  const blocks = area.bw * area.bh;
  const price = useMemo(() => priceKrw(area, tier), [area, tier]);

  useEffect(() => {
    fetch("/api/reserve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...area, tier }),
    })
      .then((r) => r.json())
      .then((d) => setAvailable(!d.error))
      .catch(() => setAvailable(false));
  }, [area, tier]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...area,
          tier,
          owner_name: ownerName,
          thumbnail_url: thumbnailUrl,
          external_url: externalUrl || undefined,
          room_title: roomTitle || undefined,
          room_description: roomDesc || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "결제 시작 실패");
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("네트워크 오류");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <Link href="/" className="text-sm opacity-70 hover:underline">
        ← 캔버스로
      </Link>
      <h1 className="text-2xl font-bold mt-3">블록 구매</h1>
      <p className="text-sm opacity-70 mt-1">
        ({area.bx}, {area.by}) · {area.bw}×{area.bh} 블록 = {blocks} 블록
      </p>

      {available === false && (
        <div className="mt-4 p-3 rounded-lg bg-red-900/40 text-red-200 text-sm">
          이 영역에 이미 점유된 블록이 있습니다.{" "}
          <Link href="/" className="underline">
            다시 선택
          </Link>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <section>
          <h2 className="text-sm font-semibold opacity-80 mb-2">티어 선택</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {TIERS.map((t) => (
              <label
                key={t}
                className={`p-3 rounded-lg border cursor-pointer ${
                  tier === t ? "border-pink-500 bg-pink-500/10" : "border-zinc-700"
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={t}
                  checked={tier === t}
                  onChange={() => setTier(t)}
                  className="sr-only"
                />
                <div className="font-medium text-sm">{TIER_LABELS[t]}</div>
                <div className="text-xs opacity-70 mt-1">
                  {formatKrw(TIER_PRICES_KRW[t])} / 블록
                </div>
              </label>
            ))}
          </div>
        </section>

        <Field label="표시 이름 (캔버스 호버 시 보임)" required>
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            maxLength={40}
            required
            className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-transparent"
            placeholder="예) 김아무개 스튜디오"
          />
        </Field>

        <Field label="썸네일 이미지 URL (캔버스에 표시됨)" required>
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-transparent"
            placeholder="https://... (정확히 영역 크기 비율 권장)"
          />
        </Field>

        {tier === "basic" ? (
          <Field label="클릭 시 이동할 외부 URL">
            <input
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-transparent"
              placeholder="https://your-site.com"
            />
          </Field>
        ) : (
          <>
            <Field label="룸 제목" required>
              <input
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                maxLength={80}
                required
                className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-transparent"
                placeholder="예) 2026 회화 전시"
              />
            </Field>
            <Field label="룸 소개글" required>
              <textarea
                value={roomDesc}
                onChange={(e) => setRoomDesc(e.target.value)}
                maxLength={2000}
                required
                rows={5}
                className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-transparent"
                placeholder="작가/브랜드 소개, 작품 설명 등"
              />
            </Field>
            <p className="text-xs opacity-60">
              ※ 결제 완료 후 룸 콘텐츠(추가 이미지·영상·임베드)는 관리자 패널에서
              편집할 수 있습니다.
            </p>
          </>
        )}

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-xs opacity-60">총 결제 금액</div>
            <div className="font-mono text-2xl">{formatKrw(price)}</div>
            <div className="text-xs opacity-60 mt-1">
              {blocks}블록 × {formatKrw(TIER_PRICES_KRW[tier])} + 위치 프리미엄
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || available === false}
            className="px-5 py-3 rounded-lg bg-pink-500 hover:bg-pink-400 disabled:opacity-50 font-medium"
          >
            {submitting ? "이동 중..." : "결제하기 →"}
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-pink-400">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
